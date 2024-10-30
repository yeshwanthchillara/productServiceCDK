import { v4 as uuidv4 } from 'uuid';
import { imageUploader } from "../helpers/imageUploader";
import { Product } from '../graphQL/types';
import * as AWS from 'aws-sdk';

// DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export const addProduct = async (args: any) => {
    try {
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
        } = args;

        const currentTime = Date.now();

        // const imageKeys = await imageUploader(images);

        // Prepare product data for DynamoDB
        const newProduct: Product = {
            id: uuidv4(),
            productName,
            description,
            discount: parseInt(discount),
            manufacturer,
            price: parseFloat(price),
            productType,
            techSpecifications: JSON.parse(techSpecifications),
            typeNewOrRefurbished,
            inventoryStock: parseInt(inventoryStock),
            sellerId: parseInt(sellerId),
            sellerContact,
            // images: imageKeys as string[],
            createdAt: currentTime,
            updatedAt: currentTime,
        };

        // Insert the product into DynamoDB
        const params = {
            TableName: TABLE_NAME,
            Item: newProduct,
        };

        await dynamoDb.put(params).promise();
        return newProduct;
    } catch (error) {
        console.error("Error saving product or images:", error);
        throw new Error("Could not create product");
    }
}