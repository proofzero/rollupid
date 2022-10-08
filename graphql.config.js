/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    galaxy: {
      schema: ["galaxy/src/schema/gql/**/*.ts"],
      extensions: {
        codegen: {
          generates: {
            "galaxy/src/schema/resolvers/galaxyTypes.ts": {
              plugins: ["typescript", "typescript-resolvers"],
            },
          },
        },
      },
    },
    threeid: {
      schema: ["galaxy/src/schema/gql/**/*.ts"],
      documents: ["threeid/gql/**/*.ts"],
      extensions: {
        codegen: {
          generates: {
            "threeid/app/utils/galaxy.server.ts": {
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request",
              ],
            },
          },
        },
      },
    },
  },
};
