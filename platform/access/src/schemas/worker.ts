import type { RpcSchema } from '@kubelt/openrpc'

import components from './components'

export const schema: RpcSchema = {
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Access Worker',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_authorize',
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
      name: 'kb_exchangeToken',
      params: [
        {
          name: 'options',
          schema: {
            type: 'object',
            oneOf: [
              {
                $ref: '#/components/contentDescriptors/ExchangeCodeOptions',
              },
              {
                $ref: '#/components/contentDescriptors/RefreshTokenOptions',
              },
            ],
          },
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/ExchangeTokenResult',
      },
    },
    {
      name: 'kb_verifyAuthorization',
      params: [
        {
          $ref: '#/components/contentDescriptors/Token',
        },
      ],
      result: {
        $ref: '#/components/contentDescriptors/VerifyResult',
      },
    },
  ],
  components,
}

export default schema
