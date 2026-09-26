import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MathPracsWebAppStack } from './mathpracs-web-app-stack';

export class MathPracsWebAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);
    new MathPracsWebAppStack(this, 'MathPracsWebAppStack', {
      stackName: 'MathPracsWebAppStack',
    });
  }
}
