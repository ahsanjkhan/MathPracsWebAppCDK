import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import {
  FRONTEND_BUCKET_NAME,
  FRONTEND_BUCKET_ID,
  FRONTEND_DISTRIBUTION_ID,
  FRONTEND_DEPLOYMENT_ID,
  FRONTEND_DEPLOYMENT_SOURCE,
  CFN_OUTPUT_FRONTEND_URL_ID,
  CFN_OUTPUT_FRONTEND_URL_DESCRIPTION,
} from "../config/constants";

export class MathPracsWebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for the frontend build (private, served only through CloudFront)
    const frontendBucket = new s3.Bucket(this, FRONTEND_BUCKET_ID, {
      bucketName: `${FRONTEND_BUCKET_NAME}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // CloudFront Distribution in front of the bucket
    const frontendDistribution = new cloudfront.Distribution(this, FRONTEND_DISTRIBUTION_ID, {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      // Client-side routing: unknown paths fall back to the React entry point
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      })),
    });

    // Upload the frontend build and invalidate the CloudFront cache
    new s3deploy.BucketDeployment(this, FRONTEND_DEPLOYMENT_ID, {
      destinationBucket: frontendBucket,
      sources: [s3deploy.Source.asset(FRONTEND_DEPLOYMENT_SOURCE)],
      distribution: frontendDistribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, CFN_OUTPUT_FRONTEND_URL_ID, {
      value: `https://${frontendDistribution.distributionDomainName}`,
      description: CFN_OUTPUT_FRONTEND_URL_DESCRIPTION
    });
  }
}
