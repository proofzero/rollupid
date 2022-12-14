import { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Account Node',
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
        schema: {},
      },
    },
  ],
}

export default schema
