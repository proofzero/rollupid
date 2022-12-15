import { RpcSchema } from '@kubelt/openrpc'

import components from './components'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Meta Node',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'get',
      params: [],
      result: {
        $ref: '#/components/contentDescriptors/MetaGetResult',
      },
    },
    {
      name: 'set',
      params: [
        {
          name: 'version',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'visibility',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/MetaSetResult',
      },
    },
  ],
  components,
}

export default schema
