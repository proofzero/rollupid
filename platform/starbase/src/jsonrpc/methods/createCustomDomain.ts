import { z } from 'zod'

import { InternalServerError } from '@proofzero/errors'

import { Context } from '../context'
import { CustomDomainSchema } from '../validators/customdomain'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  createCustomHostname,
  createWorkerRoute,
  getCloudflareFetcher,
  getExpectedCustomDomainDNSRecords,
} from '../../utils/cloudflare'
import { CustomDomain } from '../../types'

export const CreateCustomDomainInput = z.object({
  clientId: z.string(),
  hostname: z.string(),
})

export const CreateCustomDomainOutput = CustomDomainSchema

type CreateCustomDomainInput = z.infer<typeof CreateCustomDomainInput>
type CreateCustomDomainOutput = z.infer<typeof CreateCustomDomainOutput>

type CreateCustomDomainParams = {
  input: CreateCustomDomainInput
  ctx: Context
}

interface CreateCustomDomainMethod {
  (params: CreateCustomDomainParams): Promise<CreateCustomDomainOutput>
}

export const createCustomDomain: CreateCustomDomainMethod = async ({
  input,
  ctx,
}) => {
  const { clientId, hostname } = input
  const fetcher = getCloudflareFetcher(ctx.TOKEN_CLOUDFLARE_API)

  try {
    const customHostname = await createCustomHostname(
      fetcher,
      clientId,
      ctx.INTERNAL_CLOUDFLARE_ZONE_ID,
      hostname
    )
    const { id: workerRouteId } = await createWorkerRoute(
      fetcher,
      ctx.INTERNAL_CLOUDFLARE_ZONE_ID,
      hostname,
      ctx.INTERNAL_PASSPORT_SERVICE_NAME
    )
    const customDomain: CustomDomain = {
      ...customHostname,
      dns_records: await getExpectedCustomDomainDNSRecords(
        customHostname.hostname,
        ctx
      ),
    }
    const node = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)
    await node.storage.put({ customDomain, workerRouteId })
    await node.class.setCustomDomainAlarm()
    return customDomain
  } catch (cause) {
    console.error(cause)
    throw new InternalServerError({
      message: "couldn't create custom domain",
      cause,
    })
  }
}
