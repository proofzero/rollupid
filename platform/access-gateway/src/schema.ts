import { RpcSchema } from '@kubelt/openrpc'

const schema: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'Access Gateway Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_verifyAuthorization',
      params: [
        {
          name: 'token',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'authorization verification',
        schema: {
          type: 'boolean',
        },
      },
    },
  ],
}

export default schema
