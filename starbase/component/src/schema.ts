// src/schema.ts

import { RpcSchema } from "@kubelt/openrpc";

const rpcSchema: RpcSchema = {
  openrpc: "1.0.0-rc1",
  info: {
    title: "StarbaseApp",
    version: "0.1.0",
    license: {
      name: "UNLICENSED"
    }
  },
  methods: [
    {
      name: "app_name",
      summary: "Fetch the application name",
      params: [],
      result: {
        name: "appName",
        description: "The name of the application",
        schema: {
          "$ref": "#/components/contentDescriptors/AppName"
        }
      },
      errors: [],
      examples: [
        {
          name: "appNameExample",
          description: "Example of retrieving application name",
          params: [],
          result: {
            name: "appNameExampleResult",
            value: [
              {
                name: "myApp"
              }
            ]
          }
        }
      ]
    },
  ],
  components: {
    contentDescriptors: {
      "AppName": {
        name: "appName",
        required: true,
        description: "The human significant name of an application",
        schema: {
          "$ref": "#/components/schemas/AppName"
        },
      },
    },
    schemas: {
      "AppName": {
        type: "string",
      },
    }
  },
};

export default rpcSchema;
