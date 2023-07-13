import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import {
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'
import { EdgeDirection } from '@proofzero/types/graph'
import { EDGE_APPLICATION } from '../../types'
import { NoInput } from '@proofzero/platform-middleware/inputValidators'

export const ListAppsOutput = z.array(
  AppUpdateableFieldsSchema.merge(AppReadableFieldsSchema)
)

export const listApps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof NoInput>
  ctx: Context
}): Promise<z.infer<typeof ListAppsOutput>> => {
  if (!ctx.accountURN) throw new Error('No account URN in context')
  //Iterate through edges, pull out the clientId, and get app objects for each
  //app edge
  const result = []
  for (const appURN of ctx.ownAppURNs || []) {
    if (!ApplicationURNSpace.is(appURN)) continue
    const clientId = ApplicationURNSpace.decode(appURN)
    try {
      const appDO = await getApplicationNodeByClientId(
        clientId,
        ctx.StarbaseApp
      )
      const appDetails = await appDO.class.getDetails()
      if (appDetails.app) result.push(appDetails)
    } catch (e) {
      console.error(`Error when retrieving details for app ${appURN}.`, e)
    }
  }

  return result
}
