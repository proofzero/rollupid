// schema.ts

import { RpcSchema } from "@kubelt/openrpc";

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
  ],
  components: {
    contentDescriptors: {
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
      "UserName": {
        type: "string",
      },
    }
  },
};

export default rpcSchema;
