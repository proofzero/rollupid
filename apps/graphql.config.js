/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    threeid: {
      schema: ["../platform/galaxy/src/schema/types/**/*.ts"],
      documents: ["threeid/gql/**/*.graphql"],
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
