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
    createdAt: String!
    updatedAt: String!
  }

  type SampleData {
    name: String!
  }
  
  type Query {
    getProducts: SampleData
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
      sellerContact: String!
    ): Product!
  }
`;