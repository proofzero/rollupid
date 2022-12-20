import type { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Contract Node',
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
    },
    schemas: {
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
                  },
                },
              },
            },
          ],
        },
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
    },
  },
}

export default schema
