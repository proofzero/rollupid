import { z } from 'zod'
import { decodeJwt } from 'jose'

import type { AccessJWTPayload } from '@proofzero/types/access'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'

import {
  InvalidClientCredentialsError,
  MismatchClientIdError,
  MissingSubjectError,
} from '../../errors'

export const VerifyTokenMethodInput = z.object({
  token: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})
type VerifyTokenMethodInput = z.infer<typeof VerifyTokenMethodInput>

export const VerifyTokenMethodOutput = z.void()
type VerifyTokenMethodOutput = z.infer<typeof VerifyTokenMethodOutput>

type VerifyTokenParams = {
  ctx: Context
  input: VerifyTokenMethodInput
}

interface VerifyTokenMethod {
  (params: VerifyTokenParams): Promise<VerifyTokenMethodOutput>
}

export const verifyTokenMethod: VerifyTokenMethod = async ({ ctx, input }) => {
  const { token, clientId, clientSecret } = input

  if (!ctx.starbaseClient) {
    throw new Error('missing starbase client')
  }

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const payload = decodeJwt(token) as AccessJWTPayload
  if (clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const account = payload.sub
  const name = `${account}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  await accessNode.class.verify(token)
}
