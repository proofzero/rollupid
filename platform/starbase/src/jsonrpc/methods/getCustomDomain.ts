import { z } from 'zod'

import { Context } from '../context'
import { CustomDomainSchema } from '../validators/customdomain'
import { type CustomDomain } from '../../types'
import { getApplicationNodeByClientId } from '../../nodes/application'

import {
  getCloudflareFetcher,
  getCustomHostname,
  getExpectedCustomDomainDNSRecords,
} from '../../utils/cloudflare'
import { getDNSRecordValue } from '@proofzero/utils'

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
  const stored = await node.storage.get<CustomDomain>('customDomain')
  if (!stored) return
  if (!stored.dns_records) {
    //This is here as a quick way to address setups that were created
    //before infroduction of DNS records in the customDomain
    //structure. Could not load the custom domain page to delete and
    //set up again without this check.
    stored.dns_records = [
      {
        name: 'Error',
        record_type: 'TXT',
        required: true,
        expected_value: 'Delete custom domain and reconfigure',
      },
    ]
  } else {
    stored.dns_records = getExpectedCustomDomainDNSRecords(
      stored.hostname,
      stored.dns_records,
      ctx
    )
    await node.storage.put('customDomain', stored)
  }

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

  for (const dnsRec of stored.dns_records) {
    dnsRec.value = await getDNSRecordValue(dnsRec.name, dnsRec.record_type)
  }
  customDomain.dns_records = stored.dns_records

  await node.storage.put({ customDomain })
  return customDomain
}
