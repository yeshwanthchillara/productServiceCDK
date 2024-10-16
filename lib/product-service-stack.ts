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

    // Dynamodb resource
    const productTable = new dynamodb.Table(this, 'ProductTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
      tableName: 'ProductTable',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    // Dynamodb resource
    const imageTable = new dynamodb.Table(this, 'ProductImageTable', {
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
      tableName: 'ProductImageTable',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    // S3 Bucket
    const storageBucket = new s3.Bucket(this, 'PlacartStorageBucket', {
      bucketName: 'placart-storage-bucket',
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false,
    });

    // SQS resource
    const productMutationQueue = new sqs.Queue(this, 'ProductTableMutationQueue', {
      encryption: sqs.QueueEncryption.KMS_MANAGED
    });

    // Create an EventBridge rule to match DynamoDB stream events
    const rule = new eventbridge.Rule(this, 'DynamoStreamToSqsRule', {
      eventPattern: {
        source: ['aws.dynamodb'],
        detailType: ['DynamoDB Stream Record'],
        detail: {
          eventSourceARN: [productTable.tableStreamArn, imageTable.tableStreamArn],
        },
      },
    });

    // Add SQS as the target for the EventBridge rule
    rule.addTarget(new targets.SqsQueue(productMutationQueue));

    // Lambda resource
    const productServiceLambda = new lambda.Function(this, 'ProductService', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('productHandler'),
      handler: 'productHandler.handler',
      environment: {
        TABLE_NAME: productTable.tableName,
        IMAGE_TABLE_NAME: imageTable.tableName,
        S3_BUCKET_NAME: storageBucket.bucketName
      },
    });

    // API Gateway resource
    const api = new apigateway.LambdaRestApi(this, 'ProductServiceApi', {
      handler: productServiceLambda,
      proxy: false,
    });

    // Define the '/product' resource with a GET/PUT/POST/DELETE method
    const productResource = api.root.addResource('product');
    productResource.addMethod('GET');
    productResource.addMethod('PUT');
    productResource.addMethod('POST');
    productResource.addMethod('DELETE');
  }
}
