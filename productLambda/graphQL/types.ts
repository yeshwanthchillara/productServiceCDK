export interface Product {
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
    images: Array<string>;
    sellerContact: string;
    createdAt: string;
    updatedAt: string;
}