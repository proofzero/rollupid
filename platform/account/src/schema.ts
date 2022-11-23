import { RpcSchema } from '@kubelt/openrpc'

export const worker: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'Account Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_getProfile',
      params: [
        {
          name: 'coreId',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'profile',
        schema: {
          type: 'object',
        },
      },
    },
    {
      name: 'kb_setProfile',
      params: [
        {
          name: 'coreId',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'profile',
          required: true,
          schema: {
            type: 'object',
          },
        },
      ],
      result: {
        name: 'result',
        schema: false,
      },
    },
  ],
}

export const core: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'Account Core',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'getProfile',
      params: [],
      result: {
        name: 'profile',
        schema: {
          type: 'object',
        },
      },
    },
    {
      name: 'setProfile',
      params: [
        {
          name: 'profile',
          required: true,
          schema: {
            type: 'object',
          },
        },
      ],
      result: {
        name: 'result',
        schema: false,
      },
    },
  ],
}
