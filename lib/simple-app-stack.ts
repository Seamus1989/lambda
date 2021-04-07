import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from '@aws-cdk/aws-lambda';

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // bundlers https://dev.to/seeebiii/5-ways-to-bundle-a-lambda-function-within-an-aws-cdk-construct-1e28
    // esbuild https://esbuild.github.io/getting-started/#your-first-bundle
    const lambdaFunction = new lambda.NodejsFunction(this, 'my-lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'build', 'api', 'index.js'),
      handler: 'lambdaFunction',
    })
  }
}
