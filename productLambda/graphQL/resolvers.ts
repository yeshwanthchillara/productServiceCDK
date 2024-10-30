import { addProduct } from "../Controllers/addProduct";
import { Product } from "./types";

export const resolvers = {
    Mutation: {
        // Create a new product
        createProduct: async (_: any, args: any): Promise<Product> => {
            return await addProduct(args);
        },
    },
};