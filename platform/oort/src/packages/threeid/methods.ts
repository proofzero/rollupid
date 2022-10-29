export default [
  {
    name: '3id_getInviteCode',
    params: [],
    result: {
      name: 'code',
      schema: {
        type: 'string',
      },
    },
  },
  {
    name: '3id_listInvitations',
    params: [],
    result: {
      name: 'Invitations',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            contractAddress: {
              name: 'contractAddress',
              type: 'string',
            },
            tokenId: {
              name: 'tokenId',
              type: 'string',
            },
            title: {
              name: 'title',
              type: 'string',
            },
            image: {
              name: 'image',
              type: 'string',
            },
          },
        },
      },
    },
  },
  {
    name: '3id_redeemInvitation',
    params: [
      {
        name: 'contractAddress',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        name: 'tokenId',
        required: true,
        schema: {
          type: 'string',
        },
      },
    ],
    result: {
      name: 'Result',
      schema: {
        type: 'boolean',
      },
    },
  },
  {
    name: '3id_registerName',
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
      name: 'result',
      schema: {
        type: 'null',
      },
    },
  },
  {
    name: '3id_unregisterName',
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
      name: 'result',
      schema: {
        type: 'null',
      },
    },
  },
]
