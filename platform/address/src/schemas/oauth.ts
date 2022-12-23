import type { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt OAuth Address Node',
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
      name: 'getData',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/Data',
      },
    },
    {
      name: 'setData',
      params: [
        {
          $ref: '#/components/contentDescriptors/Data',
        },
      ],
      result: {
        name: 'set data result',
        schema: {},
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
      Data: {
        schema: {
          name: 'address',
          $ref: '#/components/schemas/Data',
        },
      },
      Type: {
        name: 'type',
        schema: {
          $ref: '#/components/schemas/Type',
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
      Data: {
        type: 'object',
      },
      Type: {
        type: 'string',
      },
    },
  },
}

export default schema
