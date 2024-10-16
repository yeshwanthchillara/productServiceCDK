import { ApolloServer, gql } from 'apollo-server-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { imageUploader } from './helpers/imageUploader';

// DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;
const IMAGE_TABLE_NAME = process.env.IMAGE_TABLE_NAME!;

// GraphQL Schema
const typeDefs = gql`
  type Product {
    id: ID!
    productName: String!
    description: String!
    discount: Int!
    manufacturer: String!
    price: Float!
    productType: String!
    techSpecifications: String!
    typeNewOrRefurbished: String!
    inventoryStock: Int!
    sellerId: Int!
    sellerContact: String!
    images: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Mutation {
    createProduct(
      productName: String!,
      description: String!,
      discount: Int!,
      manufacturer: String!,
      price: Float!,
      productType: String!,
      techSpecifications: String!,
      typeNewOrRefurbished: String!,
      inventoryStock: Int!,
      sellerId: Int!,
      sellerContact: String!,
      images: [Upload!]!
    ): Product!
  }
`;

// Type Definitions for Product
interface Product {
    id: string;
    productName: string;
    description: string;
    discount: number;
    manufacturer: string;
    price: number;
    productType: string;
    techSpecifications: string;
    typeNewOrRefurbished: string;
    inventoryStock: number;
    sellerId: number;
    sellerContact: string;
    createdAt: string;
    updatedAt: string;
}

// Resolvers for the GraphQL operations
const resolvers = {
    Mutation: {
        // Create a new product
        createProduct: async (_: any, args: any): Promise<Product> => {
            const {
                productName,
                description,
                discount,
                manufacturer,
                price,
                productType,
                techSpecifications,
                typeNewOrRefurbished,
                inventoryStock,
                sellerId,
                sellerContact,
                images, // Assume this contains the uploaded files
            } = args;
            const currentTime = new Date().toISOString()

            // Prepare product data for DynamoDB
            const newProduct: Product = {
                id: uuidv4(),
                productName,
                description,
                discount: parseInt(discount),
                manufacturer,
                price: parseFloat(price),
                productType,
                techSpecifications: JSON.parse(techSpecifications).map(
                    (spec: { key: string; value: string }) => `${spec.key}:${spec.value}`
                ).join(';'),
                typeNewOrRefurbished,
                inventoryStock: parseInt(inventoryStock),
                sellerId: parseInt(sellerId),
                sellerContact,
                createdAt: currentTime,
                updatedAt: currentTime,
            };

            const imageKeys = await imageUploader(images);

            // Insert the product into DynamoDB
            const params = {
                TableName: TABLE_NAME,
                Item: newProduct,
            };

            // Images keys are limited to 2 Only
            const imageDataParams = {
                RequestItems: {
                    [IMAGE_TABLE_NAME]: imageKeys.map(imagekey => ({
                        PutRequest: {
                            Item: {
                                imageLocation: '', // Specify the image location if available
                                imagekey,
                                createdAt: currentTime,
                                updatedAt: currentTime,
                                productId: newProduct.id // The ID of the newly created product
                            },
                        },
                    })),
                },
            };

            await dynamoDb.put(params).promise();
            await dynamoDb.batchWrite(imageDataParams).promise();
            return newProduct;
        },
    },
};

// Apollo Server setup for Lambda
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

export const handler = server.createHandler();
