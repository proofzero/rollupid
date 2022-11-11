// src/openrpc.ts

import { RpcSchema } from '@kubelt/openrpc'

const rpcSchema: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'Starbase',
    version: '0.1.0',
    license: {
      name: 'UNLICENSED',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
    },
  ],
  methods: [
    {
      name: 'kb_appStore',
      summary: 'Store an application record',
      tags: [
        {
          name: 'app',
        },
      ],
      params: [
        {
          name: 'ownerId',
          description: 'The ID of the application owner',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/OwnerId',
          },
        },
        {
          name: 'appId',
          description: 'A unique identifier for the application',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/AppId',
          },
        },
      ],
      result: {
        name: 'appId',
        description: 'The ID of the newly created application',
        schema: {
          $ref: '#/components/contentDescriptors/AppId',
        },
      },
      errors: [
        {
          code: 100,
          message: 'Application ID already in use',
        },
      ],
    },
    {
      name: 'kb_appFetch',
      summary: 'Info for a specific application',
      tags: [
        {
          name: 'app',
        },
      ],
      params: [
        {
          $ref: '#/components/contentDescriptors/AppSelect',
        },
      ],
      result: {
        name: 'app',
        description: 'Details for a specific application',
        schema: {
          $ref: '#/components/schemas/App',
        },
      },
    },
    {
      name: 'kb_appList',
      summary: "List a user's applications",
      params: [
        {
          $ref: '#/components/contentDescriptors/AppSelect',
        },
      ],
      result: {
        name: 'success',
        description: 'Was deletion successful?',
        schema: {
          type: 'boolean',
        },
      },
    },
    {
      name: 'kb_appDelete',
      summary: 'Delete an application',
      params: [
        {
          $ref: '#/components/contentDescriptors/AppSelect',
        },
      ],
      result: {
        name: 'success',
        description: 'Was deletion successful?',
        schema: {
          type: 'boolean',
        },
      },
    },
    {
      name: 'kb_appAuthInfo',
      summary: 'Return authorization details for an application',
      params: [
        {
          $ref: '#/components/contentDescriptors/AppSelect',
        },
      ],
      result: {
        name: 'authInfo',
        description: 'OAuth details for the app',
        schema: {
          type: 'object',
          required: [],
          properties: {
            clientId: {
              type: 'string',
            },
            clientSecret: {
              type: 'string',
            },
            redirectURI: {
              type: 'string',
              format: 'uri',
            },
            scope: {
              type: 'string',
            },
          },
        },
      },
    },
  ],
  components: {
    contentDescriptors: {
      AppSelect: {
        name: 'appSelect',
        required: true,
        description:
          'The information required to uniquely identify an application',
        schema: {
          $ref: '#/components/schemas/AppSelect',
        },
      },
    },
    schemas: {
      OwnerId: {
        type: 'string',
      },
      AppId: {
        type: 'string',
      },
      AppSelect: {
        type: 'object',
        required: ['ownerId', 'appId'],
        properties: {
          ownerId: {
            $ref: '#/components/schemas/AppId',
          },
          appId: {
            $ref: '#/components/schemas/OwnerId',
          },
        },
      },
      App: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            $ref: '#/components/schemas/AppId',
          },
          createdDate: {
            type: 'date',
          },
          name: {
            type: 'string',
          },
          icon: {
            type: 'string',
          },
          published: {
            type: 'boolean',
          },
          clientId: {
            type: 'string',
          },
          clientSecret: {
            type: 'string',
          },
          redirectURL: {
            type: 'string',
            format: 'uri',
            pattern: '^https?://',
          },
          termsURL: {
            type: 'string',
            format: 'uri',
            pattern: '^https?://',
          },
          websiteURL: {
            type: 'string',
            format: 'uri',
            pattern: '^https?://',
          },
          mirrorURL: {
            type: 'string',
            format: 'uri',
            pattern: '^https?://',
          },
          discordUser: {
            type: 'string',
          },
          mediumUser: {
            type: 'string',
          },
          twitterUser: {
            type: 'string',
          },
        },
      },
      Apps: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/App',
        },
      },
    },
  },
}

export default rpcSchema
