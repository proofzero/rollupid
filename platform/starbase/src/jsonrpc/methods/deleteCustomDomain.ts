import { z } from 'zod'

import { Context } from '../context'
import { CustomDomainSchema } from '../validators/customdomain'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  deleteCustomHostname,
  deleteWorkerRoute,
  getCloudflareFetcher,
} from '../../utils/cloudflare'
import { router } from '@proofzero/platform.core'
import { InternalServerError } from '@proofzero/errors'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { EDGE_APPLICATION } from '../../types'
import { ApplicationURNSpace } from '@proofzero/urns/application'

export const DeleteCustomDomainInput = z.object({ clientId: z.string() })
export const DeleteCustomDomainOutput = z.void()

type DeleteCustomDomainInput = z.infer<typeof DeleteCustomDomainInput>
type DeleteCustomDomainOutput = z.infer<typeof DeleteCustomDomainOutput>

type DeleteCustomDomainParams = {
  input: DeleteCustomDomainInput
  ctx: Context
}

interface DeleteCustomDomainMethod {
  (params: DeleteCustomDomainParams): Promise<DeleteCustomDomainOutput>
}

export const deleteCustomDomain: DeleteCustomDomainMethod = async ({
  input,
  ctx,
}) => {
  const { clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)

  const caller = router.createCaller(ctx)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: { dst: { baseUrn: appURN }, tag: EDGE_APPLICATION },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await identityGroupAdminValidator(ctx, ownershipURN as IdentityGroupURN)
  }

  const node = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)

  const fetcher = getCloudflareFetcher(ctx.TOKEN_CLOUDFLARE_API)

  const customDomain = await node.storage.get<
    z.infer<typeof CustomDomainSchema>
  >('customDomain')
  if (customDomain)
    await deleteCustomHostname(
      fetcher,
      ctx.INTERNAL_CLOUDFLARE_ZONE_ID,
      customDomain.id
    )

  const workerRouteId = await node.storage.get<string>('workerRouteId')
  if (workerRouteId)
    await deleteWorkerRoute(
      fetcher,
      ctx.INTERNAL_CLOUDFLARE_ZONE_ID,
      workerRouteId
    )

  await node.storage.delete(['customDomain', 'workerRouteId'])
  await node.class.unsetCustomDomainAlarm()
}
