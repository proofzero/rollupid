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
      name: 'kb_appCreate',
      summary: 'Create a new application record',
      params: [],
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
      name: 'kb_appScopes',
      summary: 'A list of scopes with their metadata.',
      tags: [
        {
          name: 'app',
        },
      ],
      params: [],
      result: {
        name: 'scopes',
        description: 'A list of scopes with their metadata.',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },
      },
      errors: [],
    },
    {
      name: 'kb_appUpdate',
      summary: 'Update an application public profile',
      params: [
        {
          name: 'clientId',
          description: 'The application OAuth client ID',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/ClientId',
          },
        },
        {
          name: 'profile',
          description: 'The public application profile fields',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/Profile',
          },
        },
      ],
      result: {
        name: 'appId',
        description: 'The ID of the updated application',
        schema: {
          $ref: '#/components/contentDescriptors/ClientId',
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
      name: 'kb_appAuthCheck',
      summary: 'Check whether or not an access should be allowed',
      params: [
        {
          name: 'appId',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'redirectURI',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'scopes',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        {
          name: 'clientId',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'clientSecret',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'allowed',
        description: 'Is access allowed?',
        schema: {
          type: 'boolean',
        },
      },
    },
    {
      name: 'kb_appRotateSecret',
      summary: 'Invalidate an old secret and replace it with a new value',
      params: [
        {
          // TODO refer to a secret content descriptor
          name: 'secret',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'success',
        schema: {
          type: 'boolean',
        },
      },
      errors: [],
    },
    {
      name: 'kb_appPublish',
      summary: 'Set the publication status of an application',
      params: [
        {
          name: 'published',
          required: true,
          schema: {
            type: 'boolean',
          },
        },
      ],
      result: {
        name: 'status',
        summary: 'The new publication status',
        schema: {
          type: 'boolean',
        },
      },
      errors: [],
    },
    {
      name: 'kb_appProfile',
      summary: 'Return the public application profile',
      params: [
        {
          name: 'clientId',
          required: true,
          schema: {
            // TODO app core ID, needs better type here
            type: 'string',
          },
        },
      ],
      result: {
        name: 'status',
        summary: 'The new publication status',
        schema: {
          $ref: '#/components/schema/AppProfile',
        },
      },
      errors: [],
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
      Profile: {
        name: 'profile',
        required: true,
        description: 'The public profile of an application',
        schema: {
          $ref: '#/components/schema/Profile',
        },
      },
    },
    schemas: {
      ClientId: {
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
          redirectURI: {
            type: 'string',
            format: 'uri',
            pattern: '^([a-z][a-z0-9+-.])*://',
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
      Profile: {
        type: 'object',
        items: [],
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
