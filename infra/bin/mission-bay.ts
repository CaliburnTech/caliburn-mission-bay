#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MissionBayStack } from '../lib/mission-bay-stack';

const app = new cdk.App();
new MissionBayStack(app, 'MissionBayStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Mission Bay — AWS infrastructure stack v1',
});
