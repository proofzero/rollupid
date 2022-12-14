import { RpcSchema } from '@kubelt/openrpc'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Account Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_getProfile',
      params: [
        {
          name: 'account',
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
          name: 'account',
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
        schema: {},
      },
    },
  ],
}

export default schema
