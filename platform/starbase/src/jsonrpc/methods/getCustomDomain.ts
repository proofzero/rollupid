import { z } from 'zod'

import { Context } from '../context'
import { CustomDomainSchema } from '../validators/app'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { getCloudflareFetcher, getCustomHostname } from '../../utils/cloudflare'

export const GetCustomDomainInput = z.object({
  clientId: z.string(),
  refresh: z.boolean().default(false),
})
export const GetCustomDomainOutput = z.optional(CustomDomainSchema)

type GetCustomDomainInput = z.infer<typeof GetCustomDomainInput>
type GetCustomDomainOutput = z.infer<typeof GetCustomDomainOutput>

type GetCustomDomainParams = {
  input: GetCustomDomainInput
  ctx: Context
}

interface GetCustomDomainMethod {
  (params: GetCustomDomainParams): Promise<GetCustomDomainOutput>
}

export const getCustomDomain: GetCustomDomainMethod = async ({
  input,
  ctx,
}) => {
  const { clientId, refresh } = input
  const node = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)

  const stored = await node.storage.get<z.infer<typeof CustomDomainSchema>>(
    'customDomain'
  )
  if (!stored) return
  if (!refresh) return stored

  const fetcher = getCloudflareFetcher(ctx.TOKEN_CLOUDFLARE_API)
  const customDomain = await getCustomHostname(
    fetcher,
    ctx.INTERNAL_CLOUDFLARE_ZONE_ID,
    stored.id
  )
  if (stored.ownership_verification)
    customDomain.ownership_verification = stored.ownership_verification

  if (stored.ssl.validation_records)
    customDomain.ssl.validation_records = stored.ssl.validation_records

  await node.storage.put({ customDomain })
  return customDomain
}
