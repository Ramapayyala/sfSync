import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing SQS queue
    const syncQueue = sqs.Queue.fromQueueArn(
      this,
      'ImportedSyncQueue',
      cdk.Fn.importValue('SyncQueueArn')
    );

    // Health Lambda
    const healthLambda = new lambda.Function(this, 'HealthLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'health.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda'))
    });

    // Salesforce ingest Lambda
    const sfIngestLambda = new lambda.Function(this, 'SfIngestLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'sfIngest.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        SYNC_QUEUE_URL: syncQueue.queueUrl
      }
    });


    syncQueue.grantSendMessages(sfIngestLambda);

    // API Gateway
    const api = new apigw.RestApi(this, 'SyncApi', {
      restApiName: 'SF-Outlook-Sync-API',
      deployOptions: { stageName: 'dev' }
    });

    // /health
    const health = api.root.addResource('health');
    health.addMethod('GET', new apigw.LambdaIntegration(healthLambda));

    // /sf/events
    const sf = api.root.addResource('sf');
    const events = sf.addResource('events');
    events.addMethod('POST', new apigw.LambdaIntegration(sfIngestLambda));
  }
}

