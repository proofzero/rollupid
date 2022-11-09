/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    galaxy: {
      schema: ['galaxy/src/schema/types/**/*.ts'],
      extensions: {
        codegen: {
          generates: {
            'galaxy/src/schema/resolvers/typedefs.ts': {
              plugins: ['typescript', 'typescript-resolvers'],
            },
          },
        },
      },
    },
  },
}
