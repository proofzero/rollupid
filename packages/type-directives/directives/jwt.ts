import { GraphQLScalarType, Kind } from 'graphql'
import { decodeJwt } from 'jose'

export class JWTString extends GraphQLScalarType {
  constructor(type: GraphQLScalarType) {
    super({
      name: 'JWTString',
      parseValue: (token) => {
        const payload = decodeJwt(token as string)
        if (!payload) {
          throw 'missing JWT payload'
        }

        if (!payload.iss) {
          throw 'missing JWT issuer'
        }

        return {
          token,
          iss: payload.iss,
        }
      },
      serialize: (token) => token,
      parseLiteral: (ast) => {
        if (ast.kind === Kind.STRING) {
          const payload = decodeJwt(ast.value)
          if (!payload || !payload.iss) {
            throw 'missing JWT payload'
          }
        }
        return type.parseLiteral(ast, {})
      },
    })
  }
}
