import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { MathPracsWebAppStage } from './mathpracs-web-app-stage';

const CDK_REPO = 'ahsanjkhan/MathPracsWebAppCDK';
const WEB_APP_REPO = 'ahsanjkhan/MathPracsWebApp';
const MAIN_BRANCH = 'main';

export class MathPracsWebAppPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = ssm.StringParameter.valueForStringParameter(this, '/mathpracs/github-connection-arn');

    const cdkSource = CodePipelineSource.connection(CDK_REPO, MAIN_BRANCH, {
      connectionArn,
      triggerOnPush: true,
    });

    const webAppSource = CodePipelineSource.connection(WEB_APP_REPO, MAIN_BRANCH, {
      connectionArn,
      triggerOnPush: true,
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MathPracsWebAppPipeline',
      pipelineType: codepipeline.PipelineType.V2,
      crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: cdkSource,
        additionalInputs: {
          '../MathPracsWebApp': webAppSource,
        },
        commands: [
          '(cd ../MathPracsWebApp/frontend && npm ci && npm run build)',
          'npm ci',
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new MathPracsWebAppStage(this, 'Beta', {
      env: { account: '655383751455', region: 'us-east-1' },
    }));

    pipeline.addStage(new MathPracsWebAppStage(this, 'Prod', {
      env: { account: '786802935034', region: 'us-east-1' },
    }));
  }
}
