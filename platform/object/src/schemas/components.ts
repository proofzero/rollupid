export default {
  contentDescriptors: {
    GetObjectResult: {
      name: 'result',
      schema: {
        $ref: '#/components/schemas/GetObjectResult',
      },
    },
    Namespace: {
      name: 'namespace',
      schema: {
        $ref: '#/components/schemas/Namespace',
      },
    },
    Options: {
      name: 'options',
      schema: {
        $ref: '#/components/schemas/Options',
      },
    },
    Path: {
      name: 'namespace',
      schema: {
        $ref: '#/components/schemas/Path',
      },
    },
    PutResult: {
      name: 'result',
      schema: {
        $ref: '#/components/schemas/PutResult',
      },
    },
    Value: {
      name: 'value',
      schema: {
        $ref: '#/components/schemas/Value',
      },
    },
  },
  schemas: {
    GetObjectResult: {
      type: 'object',
      properties: {
        value: {
          $ref: '#/components/schemas/Value',
        },
        version: {
          type: 'number',
        },
      },
    },
    Namespace: {
      type: 'string',
    },
    Options: {
      type: 'object',
    },
    Path: {
      type: 'string',
    },
    PutObjectResult: {
      type: 'object',
      properties: {
        size: {
          type: 'number',
        },
        version: {
          type: 'number',
        },
      },
    },
    Value: {
      oneOf: [
        { type: 'boolean' },
        { type: 'number' },
        { type: 'string' },
        { type: 'object' },
      ],
    },
  },
}
