import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs';

export class MissionBayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── VPC ────────────────────────────────────────────────────────────────
    // NOTE: NAT Gateway adds ~$30/month — flagged for Tiffany's review.
    // Required for Lambdas in private subnets to reach Aurora Serverless v2.
    const vpc = new ec2.Vpc(this, 'MissionBayVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
      ],
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSg', {
      vpc,
      description: 'Mission Bay Lambda functions',
      allowAllOutbound: true,
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSg', {
      vpc,
      description: 'Aurora PostgreSQL — accepts connections from Lambda',
      allowAllOutbound: false,
    });
    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Lambda access to Aurora',
    );

    // ─── COGNITO ────────────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'MissionBayUserPool', {
      userPoolName: 'mission-bay-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'MissionBayClient', {
      userPool,
      authFlows: { userPassword: true, userSrp: true },
      accessTokenValidity: cdk.Duration.minutes(15),
      refreshTokenValidity: cdk.Duration.days(30),
      idTokenValidity: cdk.Duration.minutes(15),
      generateSecret: false,
    });

    // SSO federation (Google, Azure AD, Okta) is wired via Cognito console
    // post-deploy using UserPoolIdentityProviderOidc / Saml once config is known.

    // ─── IAM — LAMBDA EXECUTION ROLE ────────────────────────────────────────
    // Role is defined early so resources below can grant permissions to it.
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // ─── S3 BUCKETS ─────────────────────────────────────────────────────────
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `mission-bay-assets-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const sbomBucket = new s3.Bucket(this, 'SbomBucket', {
      bucketName: `mission-bay-sboms-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    assetsBucket.grantReadWrite(lambdaRole);
    sbomBucket.grantReadWrite(lambdaRole);

    // ─── AURORA SERVERLESS v2 ───────────────────────────────────────────────
    // Min ACU 0 = scale to zero when idle (starts in ~1s on first request).
    // Max ACU 2 = ~$8-25/month at MVP scale.
    const dbCluster = new rds.DatabaseCluster(this, 'MissionBayDb', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      writer: rds.ClusterInstance.serverlessV2('writer', {
        scaleWithWriter: true,
      }),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 2,
      defaultDatabaseName: 'missionbay',
      credentials: rds.Credentials.fromGeneratedSecret('missionbay_admin'),
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
    });

    const dbSecret = dbCluster.secret!;

    // ─── SES ────────────────────────────────────────────────────────────────
    // Domain verification requires DNS access — Tiffany must add TXT/CNAME records.
    new ses.EmailIdentity(this, 'CaliburnDomain', {
      identity: ses.Identity.domain('caliburn.us'),
    });

    // ─── EVENTBRIDGE ────────────────────────────────────────────────────────
    const eventBus = new events.EventBus(this, 'MissionBayBus', {
      eventBusName: 'mission-bay-events',
    });

    eventBus.grantPutEventsTo(lambdaRole);

    // ─── SECRETS MANAGER — IAM ──────────────────────────────────────────────
    // DB secret is created by Aurora; per-company Anthropic keys are
    // created at runtime by the admin API under /mission-bay/anthropic/{companyId}.
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:/mission-bay/*`,
          dbSecret.secretArn,
        ],
      }),
    );

    // ─── SES + COGNITO ADMIN — IAM ──────────────────────────────────────────
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      }),
    );

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'cognito-idp:AdminUserGlobalSignOut',
          'cognito-idp:AdminResetUserPassword',
        ],
        resources: [userPool.userPoolArn],
      }),
    );

    // ─── SHARED LAMBDA ENVIRONMENT ──────────────────────────────────────────
    const commonEnv: Record<string, string> = {
      DB_SECRET_ARN: dbSecret.secretArn,
      SBOM_BUCKET: sbomBucket.bucketName,
      ASSETS_BUCKET: assetsBucket.bucketName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      EVENT_BUS_NAME: eventBus.eventBusName,
      SES_FROM_ADDRESS: 'missions@caliburn.us',
      REGION: this.region,
    };

    const lambdaDefaults = {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      role: lambdaRole,
      environment: commonEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
    };

    // ─── LAMBDA FUNCTIONS ───────────────────────────────────────────────────
    const authorizerFn = new lambda.Function(this, 'AuthorizerFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-authorizer',
      code: lambda.Code.fromAsset('../src/lambda/authorizer'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    const postConfirmFn = new lambda.Function(this, 'PostConfirmFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-post-confirm',
      code: lambda.Code.fromAsset('../src/lambda/post-confirm'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    // Wire post-confirm as Cognito post-confirmation trigger.
    // Stream E will provide the real implementation; this wires the trigger.
    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmFn);

    const catalogFn = new lambda.Function(this, 'CatalogFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-catalog',
      code: lambda.Code.fromAsset('../src/lambda/catalog'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const configsFn = new lambda.Function(this, 'ConfigsFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-configs',
      code: lambda.Code.fromAsset('../src/lambda/configs'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const sbomFn = new lambda.Function(this, 'SbomFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-sbom',
      code: lambda.Code.fromAsset('../src/lambda/sbom'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
    });

    const leadsFn = new lambda.Function(this, 'LeadsFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-leads',
      code: lambda.Code.fromAsset('../src/lambda/leads'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const adminFn = new lambda.Function(this, 'AdminFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-admin',
      code: lambda.Code.fromAsset('../src/lambda/admin'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const aiBridgeFn = new lambda.Function(this, 'AiBridgeFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-ai-bridge',
      code: lambda.Code.fromAsset('../src/lambda/ai-bridge'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
    });

    const eventConsumerFn = new lambda.Function(this, 'EventConsumerFn', {
      ...lambdaDefaults,
      functionName: 'mission-bay-event-consumer',
      code: lambda.Code.fromAsset('../src/lambda/events'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Health check — inline, no authorizer, no VPC needed
    const healthFn = new lambda.Function(this, 'HealthFn', {
      functionName: 'mission-bay-health',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(
        'exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ status: "ok" }) });',
      ),
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
    });

    // ─── EVENTBRIDGE RULE ───────────────────────────────────────────────────
    // Routes all mission-bay source events to the consumer Lambda.
    // Event types: sbom.generated, lead.created, config.saved,
    //              approval.granted, company.banned, company.unbanned
    new events.Rule(this, 'AllEventsRule', {
      eventBus,
      eventPattern: { source: ['mission-bay'] },
      targets: [new targets.LambdaFunction(eventConsumerFn)],
    });

    // ─── API GATEWAY HTTP API ───────────────────────────────────────────────
    const api = new apigatewayv2.HttpApi(this, 'MissionBayApi', {
      apiName: 'mission-bay-api',
      corsPreflight: {
        allowOrigins: ['https://missionbay.vercel.app', 'http://localhost:5173'],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.days(1),
      },
    });

    const apiAuthorizer = new authorizers.HttpLambdaAuthorizer(
      'MissionBayAuthorizer',
      authorizerFn,
      {
        responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE],
        identitySource: ['$request.header.Authorization'],
        resultsCacheTtl: cdk.Duration.seconds(0),
      },
    );

    // Helper to add a route group with Lambda integration and optional authorizer
    const addRoutes = (
      pathPrefix: string,
      fn: lambda.Function,
      withAuth: boolean,
    ) => {
      api.addRoutes({
        path: `${pathPrefix}/{proxy+}`,
        methods: [apigatewayv2.HttpMethod.ANY],
        integration: new integrations.HttpLambdaIntegration(
          `${fn.node.id}Integration`,
          fn,
        ),
        ...(withAuth ? { authorizer: apiAuthorizer } : {}),
      });
      // Also handle the prefix root without trailing segment
      api.addRoutes({
        path: pathPrefix,
        methods: [apigatewayv2.HttpMethod.ANY],
        integration: new integrations.HttpLambdaIntegration(
          `${fn.node.id}RootIntegration`,
          fn,
        ),
        ...(withAuth ? { authorizer: apiAuthorizer } : {}),
      });
    };

    addRoutes('/catalog', catalogFn, true);
    addRoutes('/configs', configsFn, true);
    addRoutes('/sboms', sbomFn, true);
    addRoutes('/leads', leadsFn, true);
    addRoutes('/admin', adminFn, true);
    addRoutes('/ai', aiBridgeFn, true);

    // /health — no authorizer
    api.addRoutes({
      path: '/health',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('HealthIntegration', healthFn),
    });

    // ─── BUDGET ALERTS ──────────────────────────────────────────────────────
    // Both alerts → tiffany@caliburn.us
    new budgets.CfnBudget(this, 'WarningBudget', {
      budget: {
        budgetName: 'mission-bay-warning',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: 25, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
          },
          subscribers: [
            { subscriptionType: 'EMAIL', address: 'tiffany@caliburn.us' },
          ],
        },
      ],
    });

    new budgets.CfnBudget(this, 'UrgentBudget', {
      budget: {
        budgetName: 'mission-bay-urgent',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: 40, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
          },
          subscribers: [
            { subscriptionType: 'EMAIL', address: 'tiffany@caliburn.us' },
          ],
        },
      ],
    });

    // ─── STACK OUTPUTS ──────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID — used by all auth flows',
      exportName: 'MissionBay-UserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID — public SPA client',
      exportName: 'MissionBay-UserPoolClientId',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiEndpoint,
      description: 'HTTP API endpoint — base URL for all Lambda routes',
      exportName: 'MissionBay-ApiUrl',
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: assetsBucket.bucketName,
      description: 'S3 bucket for maker asset uploads (logos, images, spec sheets)',
      exportName: 'MissionBay-AssetsBucket',
    });

    new cdk.CfnOutput(this, 'SbomBucketName', {
      value: sbomBucket.bucketName,
      description: 'S3 bucket for CycloneDX SBOM files (versioned, immutable)',
      exportName: 'MissionBay-SbomBucket',
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
      description: 'EventBridge bus — publish mission-bay events here',
      exportName: 'MissionBay-EventBusName',
    });

    new cdk.CfnOutput(this, 'DbSecretArn', {
      value: dbSecret.secretArn,
      description: 'Aurora admin credentials secret ARN — read by Lambda at runtime',
      exportName: 'MissionBay-DbSecretArn',
    });

    // ─── COST NOTE ──────────────────────────────────────────────────────────
    // ⚠️  NAT Gateway: ~$30/month fixed cost. Alternatives if cost is a concern:
    //     1. RDS Proxy — avoids VPC-in-Lambda for DB connections only.
    //     2. Aurora Data API — HTTP-based, no VPC required, but adds latency.
    //     Current choice keeps architecture simple for MVP; revisit post-launch.
  }
}
