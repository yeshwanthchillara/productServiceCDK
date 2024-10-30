import { ApolloServer } from 'apollo-server-lambda';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { typeDefs } from './graphQL/schema';
import { resolvers } from './graphQL/resolvers';

// Apollo Server setup for Lambda
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

export const handler: APIGatewayProxyHandler= server.createHandler();
