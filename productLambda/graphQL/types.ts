export interface Product {
    id: string;
    productName: string;
    description: string;
    discount: number;
    manufacturer: string;
    price: number;
    productType: string;
    techSpecifications: technicalSpecifications;
    typeNewOrRefurbished: string;
    inventoryStock: number;
    sellerId: number;
    // images: Array<string>;
    sellerContact: string;
    createdAt: number;
    updatedAt: number;
}

export interface technicalSpecifications {
    [key: string]: string | number | boolean;
}

export interface sampleData {
    name: string;
}