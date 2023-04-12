import { z } from 'zod'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { CODE_OPTIONS } from '../../constants'
import { initAccessNodeByName, initAuthorizationNodeByName } from '../../nodes'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { PersonaData } from '@proofzero/types/application'
import { appRouter } from '../router'
import { AccountURNSpace } from '@proofzero/urns/account'
import { SCOPES, scope as scopeSymbol } from '@proofzero/security/scopes'

export const PreAuthorizeMethodInput = z.object({
  account: AccountURNInput,
  responseType: z.string(),
  clientId: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  personaData: PersonaData.optional(),
  state: z.string(),
})

export const PreAuthorizeMethodOutput = z.discriminatedUnion('preauthorized', [
  z.object({
    preauthorized: z.literal(true),
    code: z.string(),
    state: z.string(),
  }),
  z.object({
    preauthorized: z.literal(false),
  }),
])

export type PreAuthorizeParams = z.infer<typeof PreAuthorizeMethodInput>
export type PreAuthorizeOutputParams = z.infer<typeof PreAuthorizeMethodOutput>

export const preauthorizeMethod = async ({
  input,
  ctx,
}: {
  input: PreAuthorizeParams
  ctx: Context
}): Promise<PreAuthorizeOutputParams> => {
  let preauthorized = false

  const { account, clientId, scope } = input

  console.debug('PREAUTH REQUEST', { scope })
  //If all scope values are system (ie. hidden) scope values, then we preauthorize
  if (
    scope.every((scopeVal) => {
      return (
        SCOPES[scopeSymbol(scopeVal)] && SCOPES[scopeSymbol(scopeVal)].hidden
      )
    })
  ) {
    console.debug('PREAUTHORIZED BASED ON HIDDEN SCOPE', { scope })
    preauthorized = true
  }

  //If requested scope is a subset of existing authorized scopes, we preauthorize
  if (!preauthorized) {
    const name = `${AccountURNSpace.decode(account)}@${clientId}`
    const accessNode = await initAccessNodeByName(name, ctx.Access)
    const { tokenMap } = await accessNode.class.getTokenState()
    for (const [k, v] of Object.entries(tokenMap)) {
      const existingScopeValSet = new Set(v.scope)
      if (scope.every((scopeVal) => existingScopeValSet.has(scopeVal))) {
        console.debug('PREAUTHORIZED BASED ON SCOPE SUBSET', {
          scope,
          existingScopeValSet,
        })
        preauthorized = true
        break
      }
    }
  }

  //If we're preauthorizing, we create a new code with the scope requested
  if (preauthorized) {
    const callRouter = appRouter.createCaller(ctx)
    const authRezults = await callRouter.authorize(input)
    return { ...authRezults, preauthorized }
  } else {
    return { preauthorized }
  }
}
