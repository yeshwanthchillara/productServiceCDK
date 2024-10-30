import { gql } from 'apollo-server-lambda';

// GraphQL Schema
export const typeDefs = gql`
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