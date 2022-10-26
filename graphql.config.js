/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    galaxy: {
      schema: ["projects/galaxy/src/schema/gql/**/*.ts"],
      extensions: {
        codegen: {
          generates: {
            "projects/galaxy/src/schema/resolvers/typedefs.ts": {
              plugins: ["typescript", "typescript-resolvers"],
            },
          },
        },
      },
    },
    threeid: {
      schema: ["projects/galaxy/src/schema/gql/**/*.ts"],
      documents: ["projects/threeid/gql/**/*.ts"],
      extensions: {
        codegen: {
          generates: {
            "projects/threeid/app/utils/galaxy.server.ts": {
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
