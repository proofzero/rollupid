import type { RpcSchema } from '@kubelt/openrpc'

import Node from './crypto'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Address Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_resolveAccount',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AccountURN',
      },
    },
    {
      name: 'kb_getAccount',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AccountURN',
      },
    },
    {
      name: 'kb_setAccount',
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
      name: 'kb_unsetAccount',
      params: [],
      result: {
        name: 'unset account result',
        schema: {},
      },
    },
    {
      name: 'kb_getData',
      params: [],
      result: {
        name: 'data',
        schema: {
          type: 'object',
        },
      },
    },
    {
      name: 'kb_setData',
      params: [
        {
          name: 'data',
          schema: {
            type: 'object',
          },
        },
      ],
      result: {
        name: 'set data result',
        schema: {},
      },
    },
    {
      name: 'kb_getNonce',
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
      name: 'kb_verifyNonce',
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
      name: 'kb_getAddressProfile',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/AddressProfile',
      },
    },
    {
      name: 'kb_setAddressProfile',
      params: [
        {
          $ref: '#/components/contentDescriptors/AddressProfile',
        },
      ],
      result: {
        name: 'set address profile result',
        schema: {},
      },
    },
    {
      name: 'kb_getPfpVoucher',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/PfpVoucher',
      },
    },
  ],
  components: Node.components,
}

export default schema
