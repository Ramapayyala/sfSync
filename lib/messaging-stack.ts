import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MessagingStack extends cdk.Stack {
  public readonly syncQueue: sqs.Queue;
  public readonly deadLetterQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.deadLetterQueue = new sqs.Queue(this, 'SyncDLQ', {
      retentionPeriod: cdk.Duration.days(14)
    });

    this.syncQueue = new sqs.Queue(this, 'SyncQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: this.deadLetterQueue,
        maxReceiveCount: 5
      }
    });

    // 🔹 ADD THIS EXPORT
    new cdk.CfnOutput(this, 'SyncQueueArn', {
      value: this.syncQueue.queueArn,
      exportName: 'SyncQueueArn'
    });
  }
}
