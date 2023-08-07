import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import {
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { EDGE_APPLICATION } from '../../types'
import { router } from '@proofzero/platform.core'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

export const ListGroupAppsOutput = z.array(
  AppUpdateableFieldsSchema.merge(AppReadableFieldsSchema).merge(
    z.object({
      groupName: z.string(),
      groupURN: IdentityGroupURNValidator,
    })
  )
)

export const listGroupApps = async ({
  ctx,
}: {
  ctx: Context
}): Promise<z.infer<typeof ListGroupAppsOutput>> => {
  if (!ctx.accountURN) throw new Error('No account URN in context')

  const caller = router.createCaller(ctx)

  // Get all my addresses
  const { edges: addressEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.accountURN,
      },
      tag: EDGE_ADDRESS,
    },
  })
  const addressURNList = addressEdges.map((edge) => edge.dst.baseUrn)

  // Get all groups where those addresses are members
  const addressGroupURNList = await Promise.all(
    addressURNList.map(async (au) => {
      const { edges: identityGroupEdges } = await caller.edges.getEdges({
        query: {
          src: {
            baseUrn: au,
          },
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        },
      })

      return identityGroupEdges.map((edge) => ({
        urn: edge.dst.baseUrn,
        name: edge.dst.qc.name,
      }))
    })
  )
  const flattenedUniqueGroupURNList = addressGroupURNList
    .flatMap((agul) => agul)
    .filter((v, i, a) => a.findIndex((t) => t.urn === v.urn) === i)

  // Get all apps that are part of those groups
  const groupAppURNList = await Promise.all(
    flattenedUniqueGroupURNList.map(async (gu) => {
      const { edges: appEdges } = await caller.edges.getEdges({
        query: {
          src: {
            baseUrn: gu.urn,
          },
          tag: EDGE_APPLICATION,
        },
      })

      return appEdges.map((edge) => ({
        urn: edge.dst.baseUrn,
        groupName: gu.name,
        groupURN: gu.urn as IdentityGroupURN,
      }))
    })
  )
  const flattenedAppList = groupAppURNList.flatMap((gaul) => gaul)

  //Iterate through edges, pull out the clientId, and get app objects for each
  //app edge
  const result = []
  for (const { urn, groupName, groupURN } of flattenedAppList || []) {
    if (!ApplicationURNSpace.is(urn)) continue
    const clientId = ApplicationURNSpace.decode(urn)
    try {
      const appDO = await getApplicationNodeByClientId(
        clientId,
        ctx.StarbaseApp
      )
      const appDetails = await appDO.class.getDetails()
      if (appDetails.app)
        result.push({
          ...appDetails,
          groupName,
          groupURN,
        })
    } catch (e) {
      console.error(`Error when retrieving details for app ${urn}.`, e)
    }
  }

  return result
}
