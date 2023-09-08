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
  if (!ctx.identityURN) throw new Error('No identity URN in context')

  const caller = router.createCaller(ctx)

  const { edges: identityGroupEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroupModels = identityGroupEdges.map((edge) => ({
    urn: edge.dst.baseUrn,
    name: edge.dst.qc.name,
  }))

  const groupAppURNList = await Promise.all(
    identityGroupModels.map(async (igm) => {
      const { edges: appEdges } = await caller.edges.getEdges({
        query: {
          src: {
            baseUrn: igm.urn,
          },
          tag: EDGE_APPLICATION,
        },
      })

      return appEdges.map((edge) => ({
        urn: edge.dst.baseUrn,
        groupName: igm.name,
        groupURN: igm.urn as IdentityGroupURN,
      }))
    })
  )
  const flattenedAppList = groupAppURNList.flatMap((gaul) => gaul)

  const result = await Promise.all(
    flattenedAppList.map(async ({ urn, groupName, groupURN }) => {
      const clientId = ApplicationURNSpace.decode(urn)

      const appDO = await getApplicationNodeByClientId(
        clientId,
        ctx.StarbaseApp
      )
      const appDetails = await appDO.class.getDetails()

      return {
        ...appDetails,
        groupName,
        groupURN,
      }
    })
  )

  return result
}
