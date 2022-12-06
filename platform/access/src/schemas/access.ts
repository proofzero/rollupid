import type { RpcSchema } from '@kubelt/openrpc'

import components from './components'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Access Node',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'generate',
      params: [
        {
          $ref: '#/components/contentDescriptors/AccountURN',
        },
        {
          $ref: '#/components/contentDescriptors/ClientId',
        },
        {
          $ref: '#/components/contentDescriptors/Scope',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/GenerateResult',
      },
    },
    {
      name: 'verify',
      params: [
        {
          $ref: '#/components/contentDescriptors/Token',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/VerifyResult',
      },
    },
    {
      name: 'refresh',
      params: [
        {
          $ref: '#/components/contentDescriptors/Token',
        },
      ],
      result: {
        name: 'refresh result',
        schema: {
          $ref: '#/components/schemas/GenerateResult',
        },
      },
    },
  ],
  components,
}

export default schema
