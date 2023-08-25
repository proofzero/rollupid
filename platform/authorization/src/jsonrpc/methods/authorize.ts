import { z } from 'zod'

import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { CODE_OPTIONS } from '../../constants'
import { initExchangeCodeNodeByName } from '../../nodes'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { PersonaData } from '@proofzero/types/application'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const AuthorizeMethodInput = z.object({
  identity: IdentityURNInput,
  responseType: z.string(),
  clientId: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  personaData: PersonaData.optional(),
  state: z.string(),
})

export const AuthorizeMethodOutput = z.object({
  code: z.string(),
  state: z.string(),
})

export type AuthorizeParams = z.infer<typeof AuthorizeMethodInput>

export const authorizeMethod = async ({
  input,
  ctx,
}: {
  input: AuthorizeParams
  ctx: Context
}) => {
  const {
    identity,
    responseType,
    clientId,
    redirectUri,
    scope,
    personaData,
    state,
  } = input

  const code = hexlify(randomBytes(CODE_OPTIONS.length))

  // TODO: validate the scopes are legitmate here or when we ask for it back in exchangeToken

  const node = await initExchangeCodeNodeByName(code, ctx.ExchangeCode)
  const result = await node.class.authorize(
    code,
    identity,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
    personaData
  )

  // We don't track hacky way to create user session.
  if (!scope.includes('admin')) {
    ctx.waitUntil?.(
      createAnalyticsEvent({
        eventName: 'identity_authorized_app',
        distinctId: identity,
        apiKey: ctx.POSTHOG_API_KEY,
        properties: {
          scope: scope,
          $groups: { app: clientId },
        },
      })
    )
  }

  return { ...result }
}
