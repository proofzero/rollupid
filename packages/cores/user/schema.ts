// user/schema.ts

import type { RpcSchema } from "@kubelt/openrpc";

const rpcSchema: RpcSchema = {
  openrpc: "1.0.0-rc1",
  info: {
    title: "StarbaseUser",
    version: "0.1.0",
    license: {
      name: "UNLICENSED"
    }
  },
  methods: [
    {
      name: "user_name",
      summary: "Fetch the user name",
      params: [],
      result: {
        name: "userName",
        description: "The name of the user",
        schema: {
          "$ref": "#/components/contentDescriptors/UserName"
        }
      },
      errors: [],
    },
    {
      name: "add_application",
      summary: "Add an application ID to list of user's applications",
      params: [
        {
          name: "appId",
          schema: {
            "$ref": "#/components/contentDescriptors/AppId",
          },
        },
      ],
      result: {
        name: "appId",
        description: "The application ID that was added",
        schema: {
          "$ref": "#components/contentDescriptors/AppId",
        },
      },
      errors: [],
    },
    {
      name: "list_applications",
      summary: "Return a list of the user's application IDs",
      params: [],
      result: {
        name: "appIds",
        description: "The list of user's application IDs",
        schema: {
          type: "array",
          items: {
            "$ref": "#components/contentDescriptors/AppId",
          },
        },
      },
      errors: [],
    },
  ],
  components: {
    contentDescriptors: {
      "AppId": {
        name: "appId",
        required: true,
        description: "An application ID",
        schema: {
          "$ref": "#/components/schema/AppId",
        },
      },
      "UserName": {
        name: "userName",
        required: true,
        description: "The user's human name",
        schema: {
          "$ref": "#/components/schemas/UserName"
        },
      },
    },
    schemas: {
      "AppId": {
        type: "string",
      },
      "UserName": {
        type: "string",
      },
    }
  },
};

export default rpcSchema;
