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
      params: [
        {
          name: 'clientName',
          description: 'A human-readable name for the application',
          schema: {
            type: 'string',
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
          name: 'updates',
          description: 'The app properties to be updated',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/AppUpdate',
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
          $ref: '#/components/contentDescriptors/ClientId',
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
            $ref: '#/components/contentDescriptors/ClientId',
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
          name: 'clientId',
          description: 'The application OAuth client ID',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/ClientId',
          },
        },
      ],
      result: {
        name: 'secret',
        schema: {
          type: 'string',
        },
      },
      errors: [],
    },
    {
      name: 'kb_appRotateApiKey',
      summary: 'Invalidate an old API key and replace it with a new value',
      params: [
        {
          name: 'clientId',
          required: true,
          schema: {
            $ref: '#/components/contentDescriptors/ClientId',
          },
        },
      ],
      result: {
        name: 'apiKey',
        schema: {
          type: 'string',
        },
      },
      errors: [],
    },
    {
      name: 'kb_appApiKeyCheck',
      summary: 'Validates given API key',
      params: [
        {
          name: 'apiKey',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'valid',
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
          $ref: '#/components/contentDescriptors/ClientId',
        },
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
      name: 'kb_appDetails',
      summary: 'Return the application details',
      params: [
        {
          $ref: '#/components/contentDescriptors/ClientId',
        },
      ],
      result: {
        name: 'details',
        summary: 'The application details',
        schema: {
          $ref: '#/components/schema/AppDetails',
        },
      },
      errors: [],
    },
    {
      name: 'kb_appProfile',
      summary: 'Return the public application profile',
      params: [
        {
          $ref: '#/components/contentDescriptors/ClientId',
        },
      ],
      result: {
        name: 'status',
        summary: 'The public (published) application data',
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
      ClientId: {
        name: 'clientId',
        required: true,
        description: 'An OAuth client ID, used to identify an application',
        schema: {
          $ref: '#/components/schemas/ClientId',
        },
      },
      AppUpdate: {
        name: 'updates',
        required: true,
        description: 'The app properties to be updated',
        schema: {
          $ref: '#/components/schema/AppUpdate',
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
      AppDetails: {
        type: 'object',
        required: ['clientId', 'published', 'name', 'timestamp'],
        properties: {
          appId: {
            type: 'string',
          },
          clientId: {
            type: 'string',
          },
          published: {
            type: 'boolean',
          },
          secretTimestamp: {
            type: 'number',
          },
          name: {
            type: 'string',
          },
          icon: {
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
      AppUpdate: {
        type: 'object',
        required: ['name', 'published'],
        properties: {
          name: {
            type: 'string',
          },
          icon: {
            type: 'string',
          },
          published: {
            type: 'boolean',
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
