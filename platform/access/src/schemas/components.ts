export default {
  contentDescriptors: {
    AccountURN: {
      name: 'account urn',
      schema: {
        $ref: '#/components/schemas/AccountURN',
      },
    },
    AuthorizeResult: {
      name: 'authorize result',
      schema: {
        $ref: '#/components/schemas/AuthorizeResult',
      },
    },
    ClientId: {
      name: 'client id',
      schema: {
        $ref: '#/components/schemas/ClientId',
      },
    },
    Code: {
      name: 'code',
      schema: {
        $ref: '#/components/schemas/Code',
      },
    },
    ExchangeCodeOptions: {
      name: 'exchangeCodeOptions',
      schema: {
        $ref: '#/components/schemas/ExchangeCodeOptions',
      },
    },
    ExchangeTokenResult: {
      name: 'exchange token result',
      schema: {
        $ref: '#/components/schemas/GenerateResult',
      },
    },
    GenerateResult: {
      name: 'generate result',
      schema: {
        $ref: '#/components/schemas/GenerateResult',
      },
    },
    RedirectURI: {
      name: 'redirectUri',
      schema: {
        $ref: '#/components/schemas/RedirectURI',
      },
    },
    RefreshTokenOptions: {
      name: 'refreshTokenOptions',
      schema: {
        $ref: '#/components/schemas/RefreshTokenOptions',
      },
    },
    ResponseType: {
      name: 'responseType',
      schema: {
        $ref: '#/components/schemas/ResponseType',
      },
    },
    Scope: {
      name: 'scope',
      schema: {
        $ref: '#/components/schemas/Scope',
      },
    },
    State: {
      name: 'state',
      schema: {
        $ref: '#/components/schemas/State',
      },
    },
    Token: {
      name: 'token',
      schema: {
        $ref: '#/components/schemas/Token',
      },
    },
    VerifyResult: {
      name: 'verify result',
      schema: {
        $ref: '#/components/schemas/VerifyResult',
      },
    },
  },
  schemas: {
    AccountURN: {
      type: 'string',
    },
    AuthorizeResult: {
      type: 'object',
      properties: {
        code: {
          name: 'code',
          type: 'string',
        },
        state: {
          name: 'state',
          type: 'string',
        },
      },
    },
    ClientId: {
      type: 'string',
    },
    Code: {
      type: 'string',
    },
    ExchangeCodeOptions: {
      type: 'object',
      properties: {
        account: {
          type: 'string',
        },
        grantType: {
          type: 'string',
        },
        code: {
          type: 'string',
        },
        redirectUri: {
          type: 'string',
        },
        scope: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        state: {
          type: 'string',
        },
      },
    },
    GenerateResult: {
      type: 'object',
      properties: {
        accessToken: {
          name: 'accessToken',
          type: 'string',
        },
        refreshToken: {
          name: 'refreshToken',
          type: 'string',
        },
      },
    },
    RedirectURI: {
      type: 'string',
    },
    RefreshTokenOptions: {
      type: 'object',
      properties: {
        grantType: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
    ResponseType: {
      type: 'string',
    },
    Scope: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    State: {
      type: 'string',
    },
    Token: {
      type: 'string',
    },
    VerifyResult: {
      type: 'object',
    },
  },
}
