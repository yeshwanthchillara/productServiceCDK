import { sampleData } from "../graphQL/types";

export const getAllProducts = async (args: any): Promise<sampleData> => {
    try {
        const currentTime = new Date().toISOString()
        return {
            name: "Hello from CDK Get path" + currentTime
        }
    } catch (error) {
        console.error("Error saving product or images:", error);
        throw new Error("Could not create product");
    }
}