// platform/ping:src/schema.ts

import { RpcSchema } from '@kubelt/openrpc'

const rpcSchema: RpcSchema = {
  openrpc: '1.2.4',
  info: {
    title: 'Kubelt Ping',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'kb_init',
      params: [
        {
          name: 'message',
          description: 'Upate the message returned in reply to kb_ping',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'pong',
        schema: {
          type: 'string',
        },
      },
    },
    {
      name: 'kb_ping',
      params: [],
      result: {
        name: 'pong',
        schema: {
          type: 'string',
        },
      },
    },
    {
      name: 'kb_pong',
      params: [],
      result: {
        name: 'pong',
        schema: {
          type: 'null',
        },
      },
      errors: [
        {
          code: -31999,
          message: 'cannot pong',
        },
      ],
    },
    {
      name: 'kb_delayInit',
      description: 'Schedule a message update after some duration',
      params: [
        {
          name: 'message',
          description: 'The new message to set',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'delay',
          description: 'Time delay before the new message is updated',
          schema: {
            type: 'object',
            properties: {
              years: {
                type: 'number',
              },
              months: {
                type: 'number',
              },
              weeks: {
                type: 'number',
              },
              days: {
                type: 'number',
              },
              hours: {
                type: 'number',
              },
              minutes: {
                type: 'number',
              },
              seconds: {
                type: 'number',
              },
            },
          },
        },
      ],
      result: {
        name: 'update',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message that will be set',
            },
            timestamp: {
              type: 'string',
              description: 'The time at which the message will be set',
            },
          },
        },
      },
    },
  ],
}

export default rpcSchema
