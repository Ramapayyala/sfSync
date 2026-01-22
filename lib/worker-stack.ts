import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

export class WorkerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const syncQueue = sqs.Queue.fromQueueArn(
      this,
      'ImportedSyncQueueForWorker',
      cdk.Fn.importValue('SyncQueueArn')
    );

    const workerLambda = new lambda.Function(this, 'SyncWorkerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'syncWorker.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30)
    });

    workerLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(syncQueue, {
        batchSize: 5
      })
    );

    syncQueue.grantConsumeMessages(workerLambda);
  }
}
