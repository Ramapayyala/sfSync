import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';

export class SecurityStack extends cdk.Stack {
  public readonly tokenKey: kms.Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.tokenKey = new kms.Key(this, 'TokenEncryptionKey', {
      enableKeyRotation: true,
      alias: 'sf-outlook-token-key'
    });
  }
}
