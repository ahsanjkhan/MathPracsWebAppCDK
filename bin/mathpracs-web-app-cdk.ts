#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MathPracsWebAppPipelineStack } from '../lib/mathpracs-web-app-pipeline-stack';

const app = new cdk.App();
new MathPracsWebAppPipelineStack(app, 'MathPracsWebAppPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
