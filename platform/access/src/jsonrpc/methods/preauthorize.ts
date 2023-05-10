import { z } from 'zod'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
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
  let existingPersonaData = undefined

  const { account, clientId, scope: requestedScope } = input

  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  existingPersonaData = await accessNode.storage.get('personaData')
  const { tokenMap } = await accessNode.class.getTokenState()
  for (const [k, v] of Object.entries(tokenMap)) {
    const existingScopeValSet = new Set(v.scope)
    if (requestedScope.every((scopeVal) => existingScopeValSet.has(scopeVal))) {
      console.log('Pre-authorizing based on matching scope subset:', {
        requestedScope,
        matchingExistingScopeSet: v.scope,
      })
      preauthorized = true
      break
    }
  }

  //If we're preauthorizing, we create a new code with the scope requested
  if (preauthorized) {
    if (existingPersonaData) input.personaData = existingPersonaData
    const callRouter = appRouter.createCaller(ctx)
    const authRezults = await callRouter.authorize(input)
    return { ...authRezults, preauthorized }
  } else {
    return { preauthorized }
  }
}
