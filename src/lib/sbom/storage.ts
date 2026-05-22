import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });

export async function uploadSbomToS3(params: {
  configId: string;
  companyId: string;
  json: string;
  csv: string;
}): Promise<{ jsonKey: string; csvKey: string }> {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `sboms/${params.companyId}/${params.configId}/${ts}`;
  const jsonKey = `${base}.json`;
  const csvKey = `${base}.csv`;
  const bucket = process.env.SBOM_BUCKET ?? 'mission-bay-sboms';

  await Promise.all([
    s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: jsonKey,
        Body: params.json,
        ContentType: 'application/vnd.cyclonedx+json',
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: csvKey,
        Body: params.csv,
        ContentType: 'text/csv',
      }),
    ),
  ]);

  return { jsonKey, csvKey };
}
