export default [
  {
    name: 'kb_getCoreClaims',
    params: [],
    result: {
      name: 'Claims',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  {
    name: 'kb_getCoreAddresses',
    params: [],
    result: {
      name: 'Addresses',
      schema: {
        type: 'object',
      },
    },
  },
]
