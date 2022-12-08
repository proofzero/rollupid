// platform/ping:src/node/reply/schema.ts

import { RpcSchema } from '@kubelt/openrpc'

const rpcSchema: RpcSchema = {
  openrpc: '1.2.4',
  info: {
    title: 'ReplyMessage',
    description: 'Schema for API offered by ReplyMessage component',
    version: '0.0.0',
  },
  methods: [
    {
      name: 'init',
      description: 'Store a message to be returned',
      params: [
        {
          name: 'message',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'message',
        schema: {
          type: 'string',
        },
      },
    },
    {
      name: 'message',
      description: 'Return the configured reply message',
      params: [],
      result: {
        name: 'message',
        schema: {
          type: 'string',
        },
      },
    },
    {
      name: 'schedule',
      description: 'Schedule a time-delayed message update',
      params: [
        {
          name: 'message',
          description: 'The message to set after the delay elapses',
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
              description: 'The message that will be set at scheduled time',
            },
            timestamp: {
              type: 'string',
              description: 'The scheduled update time',
            },
          },
        },
      },
    },
  ],
}

export default rpcSchema
