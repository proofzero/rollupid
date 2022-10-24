export default [
  {
    name: 'kb_getNonce',
    params: [
      {
        name: 'address',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'message_template',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'capabilities',
        schema: {
          type: 'object',
        },
      },
    ],
    result: {
      name: 'nonce',
      schema: {
        type: 'object',
        properties: {
          nonce: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
  {
    name: 'kb_verifyNonce',
    params: [
      {
        name: 'nonce',
        summary: 'Challenge Nonce',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'signature',
        summary: 'Nonce Signature',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    result: {
      name: 'jwt',
      schema: {
        type: 'string',
      },
    },
  },
]
