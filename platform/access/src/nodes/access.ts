import { exportJWK, generateKeyPair, jwtVerify, importJWK, SignJWT } from 'jose'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import type {
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  component,
  field,
  method,
  requiredField,
  scopes,
  FieldAccess,
} from '@kubelt/openrpc/component'

import { JWT_OPTIONS } from '../constants'

import schema from '../schemas/access'

import { KeyPair, KeyPairSerialized } from '../types'

@component(schema)
@field({
  name: 'account',
  doc: 'Account',
  defaultValue: null,
})
@field({
  name: 'clientId',
  doc: 'Client Id',
  defaultValue: null,
})
@field({
  name: 'scope',
  doc: 'Scope',
  defaultValue: null,
})
@field({
  name: 'signingKey',
  doc: 'Signing Key',
  defaultValue: null,
})
@scopes(['owner'])
export default class Authorization {
  @method('generate')
  @requiredField('account', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('clientId', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('scope', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('signingKey', [FieldAccess.Read, FieldAccess.Write])
  generate(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return generate(params, input, output)
  }

  @method('verify')
  @requiredField('signingKey', [FieldAccess.Read, FieldAccess.Write])
  verify(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return verify(params, input, output)
  }

  @method('refresh')
  @requiredField('account', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('clientId', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('scope', [FieldAccess.Read, FieldAccess.Write])
  @requiredField('signingKey', [FieldAccess.Read, FieldAccess.Write])
  async refresh(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    await verify(params, input, output)
    return generate(params, input, output)
  }
}

const generate = async (
  params: RpcParams,
  input: RpcInput,
  output: RpcOutput
) => {
  const objectId = params.get('objectId')
  const account = params.get('account') || input.get('account')
  const clientId = params.get('clientId') || input.get('clientId')
  const scope = params.get('scope') || input.get('scope')

  output.set('account', account)
  output.set('clientId', clientId)
  output.set('scope', scope)

  const { alg, ttl } = JWT_OPTIONS
  const { privateKey: key } = await getJWTSigningKeyPair(input, output)

  const accessToken = await new SignJWT({ client_id: clientId, scope })
    .setProtectedHeader({ alg })
    .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
    .setIssuedAt()
    .setIssuer(objectId)
    .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
    .setSubject(account)
    .sign(key)

  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
    .setIssuedAt()
    .setIssuer(objectId)
    .setSubject(account)
    .sign(key)

  return {
    accessToken,
    refreshToken,
  }
}

const verify = async (
  params: RpcParams,
  input: RpcInput,
  output: RpcOutput
) => {
  const { alg } = JWT_OPTIONS
  const { publicKey: key } = await getJWTSigningKeyPair(input, output)
  const options = { algorithms: [alg] }
  const token = params.get('token')
  return jwtVerify(token, key, options)
}

const getJWTSigningKeyPair = async (
  input: RpcInput,
  output: RpcOutput
): Promise<KeyPair> => {
  const { alg } = JWT_OPTIONS
  const stored: KeyPairSerialized = input.get('signingKey')
  if (stored) {
    return {
      publicKey: await importJWK(stored.publicKey, alg),
      privateKey: await importJWK(stored.privateKey, alg),
    }
  }

  const generated: KeyPair = await generateKeyPair(alg, {
    extractable: true,
  })

  output.set('signingKey', {
    publicKey: await exportJWK(generated.publicKey),
    privateKey: await exportJWK(generated.privateKey),
  })

  return generated
}
