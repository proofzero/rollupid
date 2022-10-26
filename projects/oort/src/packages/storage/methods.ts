export default [
  {
    name: 'kb_getData',
    params: [
      {
        name: 'namespace',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    result: {
      name: 'value',
      schema: {
        oneOf: [
          { type: 'boolean' },
          { type: 'number' },
          { type: 'string' },
          { type: 'object' },
        ],
      },
    },
  },
  {
    name: 'kb_setData',
    params: [
      {
        name: 'namespace',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'value',
        required: true,
        schema: {
          oneOf: [
            { type: 'boolean' },
            { type: 'number' },
            { type: 'string' },
            { type: 'object' },
          ],
        },
      },
    ],
    result: {
      name: 'value',
      schema: {
        oneOf: [
          { type: 'boolean' },
          { type: 'number' },
          { type: 'string' },
          { type: 'object' },
        ],
      },
    },
  },
]
