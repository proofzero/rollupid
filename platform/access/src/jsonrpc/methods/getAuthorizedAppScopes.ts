import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@proofzero/platform-middleware'
import { AccountURNSpace } from '@proofzero/urns/account'
import { appRouter } from '../router'
import {
  ClaimValuesFormat,
  claimValuesFormatter,
  getClaimValues,
} from '@proofzero/security/persona'

export const GetAuthorizedAppScopesMethodInput = z.object({
  accountURN: inputValidators.AccountURNInput,
  clientId: z.string().min(1),
})
type GetAuthorizedAppScopesMethodParams = z.infer<
  typeof GetAuthorizedAppScopesMethodInput
>

export const GetAuthorizedAppScopesMethodOutput = z.object({
  email: z
    .object({
      address: z.string(),
      urn: z.string(),
    })
    .optional(),
  connected_accounts: z
    .array(
      z.object({
        type: z.string(),
        identifier: z.string(),
        urn: z.string(),
      })
    )
    .optional(),
})

export type GetAuthorizedAppScopesMethodResult = z.infer<
  typeof GetAuthorizedAppScopesMethodOutput
>

export const getAuthorizedAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAppScopesMethodParams
  ctx: Context
}): Promise<GetAuthorizedAppScopesMethodResult> => {
  const { accountURN, clientId } = input

  const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const { tokenIndex, tokenMap } = await accessNode.class.getTokenState()

  const accessCaller = appRouter.createCaller(ctx)
  const personaData = await accessCaller.getPersonaData({
    accountUrn: accountURN,
    clientId,
  })

  const scopes = Array.from(
    new Set(tokenIndex.flatMap((t) => tokenMap[t].scope))
  )

  const claimValues = await getClaimValues(
    accountURN,
    clientId,
    scopes,
    {
      edgesFetcher: ctx.Edges,
      accountFetcher: ctx.Account,
    },
    ctx.traceSpan,
    personaData
  )

  return claimValuesFormatter(claimValues, ClaimValuesFormat.Application)
}
