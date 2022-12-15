import { RpcSchema } from '@kubelt/openrpc'

import components from './components'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Object Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_getObject',
      params: [
        {
          $ref: '#/components/contentDescriptors/Namespace',
        },
        {
          $ref: '#/components/contentDescriptors/Path',
        },
        {
          $ref: '#/components/contentDescriptors/Options',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/GetObjectResult',
      },
    },
    {
      name: 'kb_putObject',
      params: [
        {
          $ref: '#/components/contentDescriptors/Namespace',
        },
        {
          $ref: '#/components/contentDescriptors/Path',
        },
        {
          $ref: '#/components/contentDescriptors/Value',
        },
        {
          $ref: '#/components/contentDescriptors/Options',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/PutObjectResult',
      },
    },
  ],
  components,
}

export default schema
