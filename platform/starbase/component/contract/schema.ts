// schema.ts

import { RpcSchema } from "@kubelt/openrpc";

const rpcSchema: RpcSchema = {
  openrpc: "1.0.0-rc1",
  info: {
    title: "StarbaseContract",
    version: "0.1.0",
    license: {
      name: "UNLICENSED"
    }
  },
  methods: [
    {
      name: "contract_address",
      summary: "Fetch the contract address",
      params: [],
      result: {
        name: "contractAddress",
        description: "The address of the smart contract",
        schema: {
          "$ref": "#/components/contentDescriptors/ContractAddress"
        }
      },
      errors: [],
    },
  ],
  components: {
    contentDescriptors: {
      "ContractAddress": {
        name: "contractAddress",
        required: true,
        description: "The blockchain address of the smart contract",
        schema: {
          "$ref": "#/components/schemas/ContractAddress"
        },
      },
    },
    schemas: {
      "ContractAddress": {
        type: "string",
      },
    }
  },
};

export default rpcSchema;
