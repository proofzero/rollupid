import type { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Address Node',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'getAddress',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/Address',
      },
    },
    {
      name: 'setAddress',
      params: [
        {
          $ref: '#/components/contentDescriptors/Address',
        },
      ],
      result: {
        name: 'set address result',
        schema: {},
      },
    },
    {
      name: 'getType',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/Type',
      },
    },
    {
      name: 'setType',
      params: [
        {
          $ref: '#/components/contentDescriptors/Type',
        },
      ],
      result: {
        name: 'set type result',
        schema: {},
      },
    },
    {
      name: 'isWebhookRegistered',
      params: [],
      result: {
        name: 'is webhook registered result',
        schema: {
          type: 'boolean',
        },
      },
    },
    {
      name: 'registerWebhook',
      params: [],
      result: {
        name: 'register webhook result',
        schema: {},
      },
    },
    {
      name: 'isTokensIndexed',
      params: [],
      result: {
        name: 'is tokens indexed result',
        schema: {
          type: 'boolean',
        },
      },
    },
    {
      name: 'indexedTokens',
      params: [],
      result: {
        name: 'indexed token result',
        schema: {},
      },
    },
    {
      name: 'resolveAccount',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AccountURN',
      },
    },
    {
      name: 'getAccount',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AccountURN',
      },
    },
    {
      name: 'setAccount',
      params: [
        {
          $ref: '#/components/contentDescriptors/AccountURN',
        },
      ],
      result: {
        name: 'set account result',
        schema: {},
      },
    },
    {
      name: 'unsetAccount',
      params: [],
      result: {
        name: 'unset account result',
        schema: {},
      },
    },
    {
      name: 'getNonce',
      params: [
        {
          name: 'address',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'template',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'redirectUri',
          schema: {
            type: 'string',
          },
        },
        {
          $ref: '#/components/contentDescriptors/Scope',
        },
        {
          name: 'state',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/Nonce',
      },
    },
    {
      name: 'verifyNonce',
      params: [
        {
          name: 'nonce',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'signature',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/AuthorizeResult',
      },
    },
    {
      name: 'getProfile',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AddressProfile',
      },
    },
    {
      name: 'setProfile',
      params: [
        {
          $ref: '#/components/contentDescriptors/AddressProfile,',
        },
      ],
      result: {
        name: 'set profile result',
        schema: {},
      },
    },
    {
      name: 'getPfpVoucher',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/PfpVoucher',
      },
    },
    {
      name: 'setPfpVoucher',
      params: [
        {
          $ref: '#/components/contentDescriptors/PfpVoucher',
        },
      ],
      result: {
        name: 'set pfp voucher result',
        schema: {},
      },
    },
    {
      name: 'getWebHook',
      params: [
        {
          name: 'webhook_id',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/Webhook',
      },
    },
    {
      name: 'setWebhook',
      params: [
        {
          $ref: '#/components/contentDescriptors/Webhook',
        },
      ],
      result: {
        name: 'set webhook result',
        schema: {},
      },
    },
  ],
  components: {
    contentDescriptors: {
      AccountURN: {
        name: 'account urn',
        schema: {
          $ref: '#/components/schemas/AccountURN',
        },
      },
      Address: {
        schema: {
          name: 'address',
          $ref: '#/components/schemas/Address',
        },
      },
      AddressProfile: {
        name: 'profile',
        schema: {
          $ref: '#/components/schemas/AddressProfile',
        },
      },
      AuthorizeResult: {
        name: 'authorize result',
        schema: {
          $ref: '#/components/schemas/AuthorizeResult',
        },
      },
      Nonce: {
        name: 'nonce',
        schema: {
          $ref: '#/components/schemas/Nonce',
        },
      },
      PfpVoucher: {
        name: 'voucher',
        schema: {
          $ref: '#/components/schemas/PfpVoucher',
        },
      },
      Scope: {
        name: 'scope',
        schema: {
          $ref: '#/components/schemas/Scope',
        },
      },
      Type: {
        name: 'type',
        schema: {
          $ref: '#/components/schemas/Type',
        },
      },
      Webhook: {
        name: 'webhook',
        schema: {
          $ref: '#/components/schemas/Webhook',
        },
      },
    },
    schemas: {
      AccountURN: {
        type: 'string',
      },
      Address: {
        type: 'string',
      },
      AddressProfile: {
        type: {
          oneOf: [
            {
              type: 'null',
            },
            {
              type: 'object',
              properties: {
                cover: {
                  oneOf: [
                    {
                      type: 'null',
                    },
                    {
                      type: 'string',
                    },
                  ],
                },
                displayName: {
                  type: 'string',
                },
                pfp: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                    },
                    isToken: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          ],
        },
      },
      AuthorizeResult: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
          },
          state: {
            type: 'string',
          },
        },
      },
      Nonce: {
        type: 'string',
      },
      PfpVoucher: {
        oneOf: [
          {
            type: 'null',
          },
          {
            type: 'object',
          },
        ],
      },
      Scope: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      Type: {
        type: 'string',
      },
      Webhook: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          signingKey: {
            type: 'string',
          },
        },
      },
    },
  },
}

export default schema
