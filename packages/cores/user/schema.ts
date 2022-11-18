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
    {
      name: "index_application",
      summary: "Index an application to enable lookup",
      params: [
        {
          name: "id",
          summary: "The unique application identifier",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          name: "data",
          summary: "An application record",
          required: true,
          schema: {
            type: "object"
          }
        },
        {
          name: "fields",
          summary: "A list of field names to index",
          required: true,
          schema: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      ],
      result: {
        name: "appId",
        description: "The ID of the indexed application",
        schema: {
          type: "string",
        },
      },
      errors: [],
    },
    {
      name: "lookup_application",
      summary: "Find an application ID by indexed field(s)",
      params: [

      ],
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
