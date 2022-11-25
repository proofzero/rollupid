/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    apps: {
      schema: ['../platform/galaxy/src/schema/types/**/*.ts'],
      documents: ['**/gql/**/*.graphql'],
      extensions: {
        codegen: {
          generates: {
            'threeid/app/utils/galaxy.server.ts': {
              plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
              ],
              config: {
                rawRequest: false,
              },
            },
            'passport/app/galaxy.server.ts': {
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
