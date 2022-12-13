import type { RpcSchema } from '@kubelt/openrpc'

import components from './components'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Authorization Node',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'authorize',
      params: [
        {
          $ref: '#/components/contentDescriptors/AccountURN',
        },
        {
          $ref: '#/components/contentDescriptors/ResponseType',
        },
        {
          $ref: '#/components/contentDescriptors/ClientId',
        },
        {
          $ref: '#/components/contentDescriptors/RedirectURI',
        },
        {
          $ref: '#/components/contentDescriptors/Scope',
        },
        {
          $ref: '#/components/contentDescriptors/State',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/AuthorizeResult',
      },
    },
    {
      name: 'exchangeToken',
      params: [
        {
          $ref: '#/components/contentDescriptors/Code',
        },
        {
          $ref: '#/components/contentDescriptors/RedirectURI',
        },
        {
          $ref: '#/components/contentDescriptors/ClientId',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/ExchangeTokenResult',
      },
    },
  ],
  components,
}

export default schema
