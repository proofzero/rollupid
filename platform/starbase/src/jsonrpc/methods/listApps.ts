import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'
import createEdgesClient from '@kubelt/platform-clients/edges'
import {
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'
import { EdgeDirection } from '@kubelt/types/graph'
import { EDGE_APPLICATION } from '../../types'

export const ListAppsOutput = z.array(
  AppUpdateableFieldsSchema.merge(AppReadableFieldsSchema)
)

export const NoInput = z.undefined()

export const listApps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof NoInput>
  ctx: Context
}): Promise<z.infer<typeof ListAppsOutput>> => {
  if (!ctx.accountURN) throw new Error('No account URN in context')
  //Get application edges for the given accountURN
  const edgesClient = createEdgesClient(ctx.Edges)
  const edgeList = await edgesClient.getEdges.query({
    query: {
      id: ctx.accountURN,
      dir: EdgeDirection.Outgoing,
      tag: EDGE_APPLICATION,
    },
  })
  //Iterate through edges, pull out the clientId, and get app objects for each
  //app edge
  const result = []
  for (const edge of edgeList && edgeList.edges) {
    const appURN = edge.dst.id as ApplicationURN
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
