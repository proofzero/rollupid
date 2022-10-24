// src/openrpc.ts

import { RpcSchema } from "@kubelt/openrpc";

const rpcSchema: RpcSchema = {
  openrpc: "1.0.0-rc1",
  info: {
    title: "Starbase",
    version: "0.1.0",
    license: {
      name: "UNLICENSED",
    }
  },
  servers: [
    {
      url: "http://localhost:8080",
    }
  ],
  methods: [
    {
      name: "app_create",
      summary: "Create an application",
      tags: [
        {
          name: "app",
        },
      ],
      params: [
        {
          name: "ownerId",
          description: "The ID of the application owner",
          required: true,
          schema: {
            "$ref": "#/components/contentDescriptors/OwnerId",
          }
        },
        {
          name: "appId",
          description: "A unique identifier for the application",
          required: true,
          schema: {
            "$ref": "#/components/contentDescriptors/AppId",
          }
        }

      ],
      result: {
        name: "appId",
        description: "The ID of the newly created application",
        schema: {
          "$ref": "#/components/contentDescriptors/AppId",
        }
      },
      errors: [
        {
          code: 100,
          message: "Application ID already in use",
        }
      ],
      examples: [
        {
          name: "createAppExample",
          description: "Create Application example",
          params: [
            {
              name: "ownerId",
              value: "joe",
            },
            {
              name: "appId",
              value: "foobar",
            },
          ],
          result: {
            name: "createAppResultExample",
            value: [
              {
                id: "foobar",
              },
            ]
          }
        }
      ]
    },
    {
      name: "app_fetch",
      summary: "Info for a specific application",
      tags: [
        {
          name: "app",
        },
      ],
      params: [
        {
          "$ref": "#/components/contentDescriptors/AppSelect",
        }
      ],
      result: {
        name: "app",
        description: "Details for a specific application",
        schema: {
          "$ref": "#/components/schemas/App",
        },
      },
      examples: [
        {
          name: "fetchAppExample",
          description: "Fetch application example",
          params: [
            {
              name: "appId",
              value: "foobar",
            },
          ],
          result: {
            name: "fetchAppExampleResult",
            value: {
              id: "foobar",
              name: "Foo Bar",
            },
          },
        },
      ],
    },
  ],
  components: {
    contentDescriptors: {
      "AppSelect": {
        name: "appSelect",
        required: true,
        description: "The information required to uniquely identify an application",
        schema: {
          "$ref": "#/components/schemas/AppSelect",
        },
      },
    },
    schemas: {
      "OwnerId": {
        type: "string",
      },
      "AppId": {
        type: "string",
      },
      "AppSelect": {
        type: "object",
        required: [
          "ownerId",
          "appId",
        ],
        properties: {
          ownerId: {
            "$ref": "#/components/schemas/AppId",
          },
          appId: {
            "$ref": "#/components/schemas/OwnerId",
          },
        },
      },
      "App": {
        type: "object",
        required: [
          "id",
          "name",
        ],
        properties: {
          id: {
            "$ref": "#/components/schemas/AppId",
          },
          createdDate: {
            type: "date",
          },
          name: {
            type: "string",
          },
          icon: {
            type: "string",
          },
          published: {
            type: "boolean",
          },
          secret: {
            type: "string",
          },
          redirectURL: {
            type: "string",
            format: "uri",
            pattern: "^https?://",
          },
          termsURL: {
            type: "string",
            format: "uri",
            pattern: "^https?://",
          },
          websiteURL: {
            type: "string",
            format: "uri",
            pattern: "^https?://",
          },
          mirrorURL: {
            type: "string",
            format: "uri",
            pattern: "^https?://",
          },
          discordUser: {
            type: "string",
          },
          mediumUser: {
            type: "string",
          },
          twitterUser: {
            type: "string",
          },
        },
      },
      "Apps": {
        type: "array",
        items: {
          "$ref": "#/components/schemas/App",
        },
      },
    },
  },
};

export default rpcSchema;
