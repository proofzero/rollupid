export default [
  {
    name: 'kb_getObject',
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
        name: 'options',
        required: false,
        schema: {
          type: 'object',
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
    name: 'kb_putObject',
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
      {
        name: 'options',
        required: false,
        schema: {
          type: 'object',
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
