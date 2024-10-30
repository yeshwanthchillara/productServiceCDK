import { addProduct } from "../Controllers/addProduct";
import { Product, sampleData } from "./types";
import { getAllProducts } from "../Controllers/getAllProducts";

export const resolvers = {
    Query: {
        // Get a product by ID
        getProducts: async (_: any, args: any): Promise<sampleData> => {
            return await getAllProducts(args)
        },
    },
    Mutation: {
        // Create a new product
        createProduct: async (_: any, args: any): Promise<Product> => {
            return await addProduct(args);
        },
    },
};