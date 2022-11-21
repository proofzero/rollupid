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
      name: "init",
      summary: "Store the initial copy of the application record",
      params: [
        // TODO
      ],
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
      name: "update",
      summary: "Update the public application profile",
      params: [
        // TODO
      ],
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
      name: "fetch",
      summary: "Fetch the complete application record",
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
      name: "profile",
      summary: "Return public view of application data",
      params: [],
      result: {
        name: "profile",
        description: "Public application data",
        schema: {
          type: "object"
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
