import { z } from 'zod'
import { Context } from '../context'
import { ApplicationURNSpace } from '@kubelt/urns/application'
import { AppClientIdParamSchema } from '../validators/app'

export const ListAppAccountsInput = AppClientIdParamSchema
export const ListAppAccountsOutput = z.array(
  z.object({
    accountURN: z.string(),
    timestamp: z.number(),
  })
)
export const listAppAccounts = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof ListAppAccountsInput>
  ctx: Context
}): Promise<z.infer<typeof ListAppAccountsOutput>> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  if (!ctx.accountURN) throw new Error('No account URN in context')

  // TODO: Get a list of all access edges to cliendId
  // TODO: Filter for unique accountURNs and the first (or last?) entry
  // TODO: Send accountURNs and timestamps of said edges

  return []
}
