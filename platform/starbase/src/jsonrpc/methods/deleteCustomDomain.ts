import { z } from 'zod'

import { Context } from '../context'
import { CustomDomainSchema } from '../validators/customdomain'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  deleteCustomHostname,
  deleteWorkerRoute,
  getCloudflareFetcher,
} from '../../utils/cloudflare'

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
