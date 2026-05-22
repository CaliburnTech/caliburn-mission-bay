import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, err } from '../../lib/response';
import { assembleSbom } from '../../lib/sbom/assembler';
import { serializeToCycloneDx, serializeToCsv } from '../../lib/sbom/serializer';
import { uploadSbomToS3 } from '../../lib/sbom/storage';

const eb = new EventBridgeClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const body = JSON.parse(event.body ?? '{}') as { savedConfigurationId?: string };
    const { savedConfigurationId } = body;

    if (!savedConfigurationId) return err(400, 'savedConfigurationId required');

    // 1. Fetch configuration + full dependency tree
    const configuration = await prisma.savedConfiguration.findUnique({
      where: { id: savedConfigurationId },
      include: {
        company: true,
        products: {
          include: {
            version: {
              include: {
                product: { include: { company: true } },
                license: true,
                components: {
                  include: { component: { include: { license: true } } },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!configuration) return err(404, 'Configuration not found');

    if (!auth.isSuperAdmin && configuration.companyId !== auth.companyId) {
      return err(403, 'Forbidden');
    }

    // 2. Assemble
    const assembled = assembleSbom({ configuration });

    // 3. Serialize
    const generatedAt = new Date();
    const json = serializeToCycloneDx(assembled, {
      configId: configuration.id,
      companyName: configuration.company.name,
      generatedAt,
    });
    const csv = serializeToCsv(assembled);

    // 4. Upload to S3
    const { jsonKey, csvKey } = await uploadSbomToS3({
      configId: configuration.id,
      companyId: configuration.companyId,
      json,
      csv,
    });

    // 5. Write Sbom record
    const sbom = await prisma.sbom.create({
      data: {
        savedConfigurationId: configuration.id,
        format: 'CYCLONEDX_1_5',
        s3Key: jsonKey,
        componentCount: assembled.counts.components,
        topLevelCount: assembled.counts.topLevel,
        dependencyCount: assembled.counts.dependencies,
        licenseCount: assembled.counts.licenses,
        generatedAt,
        generatedByUserId: auth.userId,
        destinationStatus: 'pending',
      },
    });

    // 6. Emit EventBridge event
    await eb.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: process.env.EVENT_BUS_NAME,
            Source: 'mission-bay',
            DetailType: 'sbom.generated',
            Detail: JSON.stringify({
              sbomId: sbom.id,
              configId: configuration.id,
              companyId: configuration.companyId,
              s3JsonKey: jsonKey,
              s3CsvKey: csvKey,
              counts: assembled.counts,
            }),
          },
        ],
      }),
    );

    return ok({
      sbomId: sbom.id,
      s3Key: jsonKey,
      counts: assembled.counts,
    });
  } catch (e: unknown) {
    console.error(e);
    return err(500, 'SBOM generation failed');
  }
};
