import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as eventbridge from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const productTable = new dynamodb.Table(this, 'ProductTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
      tableName: 'ProductTable',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // S3 Bucket
    const storageBucket = new s3.Bucket(this, 'PlacartAssetStorage', {
      bucketName: 'placart-asset-storage',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false,
      autoDeleteObjects: true,
    });

    // SQS Queue
    const productMutationQueue = new sqs.Queue(this, 'ProductTableMutationQueue', {
      encryption: sqs.QueueEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // EventBridge Rule for DynamoDB Stream Events
    const rule = new eventbridge.Rule(this, 'DynamoStreamToSqsRule', {
      eventPattern: {
        source: ['aws.dynamodb'],
        detailType: ['DynamoDB Stream Record'],
        detail: {
          eventSourceARN: [productTable.tableStreamArn],
        },
      },
    });

    // Add SQS as target for EventBridge rule
    rule.addTarget(new targets.SqsQueue(productMutationQueue));

    // Lambda Function
    const productServiceLambda = new lambda.Function(this, 'ProductService', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('productLambda'),
      handler: 'productHandler.handler',
      environment: {
        TABLE_NAME: productTable.tableName,
        S3_BUCKET_NAME: storageBucket.bucketName,
      },
    });

    // Create API Gateway
    const api = new apigateway.LambdaRestApi(this, 'ProductServiceApi', {
      handler: productServiceLambda,
      proxy: false,
      deployOptions: {
        stageName: 'dev',
      },
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    // Define '/product' resource with methods
    const productResource = api.root.addResource('product');

    // Add methods to the resource
    productResource.addMethod('GET');
    productResource.addMethod('PUT');
    productResource.addMethod('POST');
    productResource.addMethod('DELETE');

    // Grant Lambda permissions to DynamoDB and S3
    productTable.grantReadWriteData(productServiceLambda);
    storageBucket.grantReadWrite(productServiceLambda);

    // Add an output for the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.urlForPath('/'),
      description: 'The URL of the Product Service API',
    });
  }
}
