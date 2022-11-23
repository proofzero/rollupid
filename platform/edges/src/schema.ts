// @kubelt/platform.edges:src/schema.ts

import { RpcSchema } from '@kubelt/openrpc'

const rpcSchema: RpcSchema = {
  openrpc: '1.0.0-rc1',
  info: {
    title: 'Edges',
    version: '0.1.0',
    license: {
      name: 'UNLICENSED',
    },
  },
  methods: [
    {
      name: 'kb_makeEdge',
      summary: 'Create a new edge',
      params: [
        // src
        // dst
        // tag
        // perms
      ],
      result: {
        name: 'edgeId',
        description: 'The ID of the newly created edge',
        schema: {
          $ref: '#/components/contentDescriptors/EdgeId',
        },
      },
      errors: [],
    },
    {
      name: 'kb_getEdges',
      summary: 'Get edges for some node',
      params: [
        {
          name: 'id',
          description: 'The ID (a URN) of a node',
          schema: {
            // TODO define a NodeID type
            type: 'string',
          }
        },
        {
          name: 'direction',
          schema: {
            type: 'string',
            enum: ['incoming', 'outgoing'],
          }
        },
      ],
      result: {
        name: 'edges',
        description: 'The list of edges originating or terminating at a node',
        schema: {
          type: 'array',
        },
      },
      errors: [],
    },
    {
      name: 'kb_rmEdge',
      summary: 'Remove an existing edge',
      params: [
        {
          name: 'src',
          description: 'The source node URN',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'dst',
          description: 'The destination node URN',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'tag',
          description: 'The edge type URN',
          schema: {
            type: 'string',
          },
        },
      ],
      result: {
        name: 'edgeId',
        description: 'The ID of the removed edge',
        schema: {
          $ref: '#/components/contentDescriptors/EdgeId',
        },
      },
      errors: [],
    },
    {
      name: 'kb_findNode',
      summary: 'Find a node by searching for URN components',
      params: [
        {
          name: 'nid',
          description: 'A node URN namespace identifier',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'nss',
          description: 'A node URN namespace specific string',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'f',
          description: 'A node URN fragment',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'qc',
          description: 'A node URN Q-component',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        {
          name: 'rc',
          description: 'A node URN R-component',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      ],
      result: {
        name: 'nodes',
        description: 'A list of any nodes matching the search parameters',
        schema: {

        },
      },
      errors: [],
    },
  ],
  components: {
    contentDescriptors: {
      EdgeId: {
        name: 'edgeId',
        required: true,
        description: 'An edge identifier',
        schema: {
          $ref: '#/components/schemas/EdgeId',
        },
      },
    },
    schemas: {
      EdgeId: {
        type: 'string',
      },
    },
  },
}

export default rpcSchema
