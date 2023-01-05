/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    default: {
      schema: ['../../platform/galaxy/src/schema/types/**/*.ts'],
      documents: ['./gql/**/*.graphql'],
      extensions: {
        codegen: {
          generates: {
            'index.ts': {
              plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
              ],
              config: {
                rawRequest: false,
              },
            },
          },
        },
      },
    },
  },
}
