import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from '@aws-cdk/aws-lambda';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as apigateway from "@aws-cdk/aws-apigateway";

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // bundlers https://dev.to/seeebiii/5-ways-to-bundle-a-lambda-function-within-an-aws-cdk-construct-1e28
    // esbuild https://esbuild.github.io/getting-started/#your-first-bundle


    const bucket = new Bucket(this, 'MySimpleAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

   
    const bucketContainerPermissions =  new PolicyStatement();

    bucketContainerPermissions.addResources(bucket.bucketArn);
    // gives permission to list bucket 
    bucketContainerPermissions.addActions('s3:ListBucket')
    // gives permission to see actual content
    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`)
    // give access to put and get to the bucket
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject')

    const mainLambdaFunction = new lambda.NodejsFunction(this, 'my-lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'build', 'api', 'index.js'),
      handler: 'lambdaFunction',
    })

    const getPhotosLambda = new lambda.NodejsFunction(this, 'my-photo-lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'build', 'api', 'get-photos-index.js'),
      handler: 'photoLambdaFunction',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName,
      }
    })

    getPhotosLambda.addToRolePolicy(bucketPermissions)
    getPhotosLambda.addToRolePolicy(bucketContainerPermissions)

    const api = new apigateway.LambdaRestApi(this, 'MySimpleApiGateway', {
      handler: mainLambdaFunction,
    })

    new cdk.CfnOutput(this, 'MySimpleAppBucketExport', {
      value: bucket.bucketName,
      exportName: 'MySimpleAppBucketName',
    })
  }
}
