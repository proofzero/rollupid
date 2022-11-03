// schema.ts

import type { RpcSchema } from "@kubelt/openrpc";

const rpcSchema: RpcSchema = {
  openrpc: "1.0.0-rc1",
  info: {
    title: "StarbaseApplication",
    version: "0.1.0",
    license: {
      name: "UNLICENSED"
    }
  },
  methods: [
    {
      name: "app_store",
      summary: "Store an application record",
      params: [],
      result: {
        name: "app",
        description: "An application record",
        schema: {
          "$ref": "#/components/contentDescriptors/Application"
        }
      },
      errors: [],
    },
    {
      name: "app_fetch",
      summary: "Fetch the application record",
      params: [],
      result: {
        name: "app",
        description: "An application record",
        schema: {
          "$ref": "#/components/contentDescriptors/Application"
        }
      },
      errors: [],
    },
  ],
  components: {
    contentDescriptors: {
      "Application": {
        name: "app",
        required: true,
        description: "An application record",
        schema: {
          "$ref": "#/components/schemas/Application"
        },
      },
    },
    schemas: {
      "Application": {
        type: "object",
      },
    }
  },
};

export default rpcSchema;
