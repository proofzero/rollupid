export default [
  {
    name: 'ens_lookupAddress',
    params: [
      {
        name: 'address',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    result: {
      name: 'name',
      schema: {
        type: 'string',
      },
    },
  },
]
