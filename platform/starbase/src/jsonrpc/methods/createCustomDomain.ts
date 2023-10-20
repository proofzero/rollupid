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
import { groupAdminValidatorByClientID } from '@proofzero/security/identity-group-validators'

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

  await groupAdminValidatorByClientID(ctx, clientId)

  const fetcher = getCloudflareFetcher(ctx.env.TOKEN_CLOUDFLARE_API)

  try {
    const customHostname = await createCustomHostname(
      fetcher,
      clientId,
      ctx.env.INTERNAL_CLOUDFLARE_ZONE_ID,
      hostname
    )
    const { id: workerRouteId } = await createWorkerRoute(
      fetcher,
      ctx.env.INTERNAL_CLOUDFLARE_ZONE_ID,
      hostname,
      ctx.env.INTERNAL_PASSPORT_SERVICE_NAME
    )
    const customDomain: CustomDomain = {
      ...customHostname,
      dns_records: getExpectedCustomDomainDNSRecords(
        customHostname.hostname,
        [],
        ctx
      ),
    }
    const node = await getApplicationNodeByClientId(
      clientId,
      ctx.env.StarbaseApp
    )
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
