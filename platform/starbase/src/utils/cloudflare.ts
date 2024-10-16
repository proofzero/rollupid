import { InternalServerError } from '@proofzero/errors'
import { CustomDomain, CustomDomainDNSRecords } from '../types'
import { Context } from '../jsonrpc/context'

const API_URL = 'https://api.cloudflare.com/client/v4'

interface Response<R = object> {
  success: boolean
  errors: Array<string>
  result: R
}

type CloudflareFetcher = <R = object>(
  path: string,
  init: RequestInit<RequestInitCfProperties>
) => Promise<R>

type CustomHostname = {
  id: string
  hostname: string
  ownership_verification?: {
    name: string
    type: string
    value: string
  }
  ssl: {
    status: string
    validation_records?: Array<{
      status: string
      txt_name: string
      txt_value: string
    }>
  }
  status: string
}

export const getCloudflareFetcher = (token: string): CloudflareFetcher => {
  return async <R = object>(
    path: string,
    init: RequestInit<RequestInitCfProperties>
  ): Promise<R> => {
    const response = await fetch(`${API_URL}/${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const responseBody = await response.json<Response<R>>()
    if (response.ok) {
      return responseBody.result
    } else {
      console.error(responseBody.errors[0])
      throw new InternalServerError({
        message: 'Cloudflare API Error',
        cause: responseBody.errors[0],
      })
    }
  }
}

type CreateCustomHostnameResult = CustomHostname

export const createCustomHostname = async (
  fetcher: CloudflareFetcher,
  clientId: string,
  zoneId: string,
  hostname: string
): Promise<CreateCustomHostnameResult> => {
  return fetcher<CreateCustomHostnameResult>(
    `zones/${zoneId}/custom_hostnames`,
    {
      method: 'POST',
      body: JSON.stringify({
        custom_metadata: { clientId },
        hostname,
        ssl: {
          method: 'txt',
          settings: {
            ciphers: ['ECDHE-RSA-AES128-GCM-SHA256', 'AES128-SHA'],
            early_hints: 'on',
            http2: 'on',
            min_tls_version: '1.2',
            tls_1_3: 'on',
          },
          type: 'dv',
          wildcard: false,
        },
      }),
    }
  )
}

type DeleteCustomHostnameResult = void

export const deleteCustomHostname = async (
  fetcher: CloudflareFetcher,
  zoneId: string,
  id: string
): Promise<DeleteCustomHostnameResult> => {
  return fetcher<DeleteCustomHostnameResult>(
    `zones/${zoneId}/custom_hostnames/${id}`,
    { method: 'DELETE' }
  )
}

type GetCustomHostnameResult = CustomDomain

export const getCustomHostname = async (
  fetcher: CloudflareFetcher,
  zoneId: string,
  id: string
): Promise<GetCustomHostnameResult> => {
  return fetcher<GetCustomHostnameResult>(
    `zones/${zoneId}/custom_hostnames/${id}`,
    { method: 'GET' }
  )
}

type CreateWorkerRouteResult = {
  id: string
}

export const createWorkerRoute = async (
  fetcher: CloudflareFetcher,
  zoneId: string,
  hostname: string,
  service: string
): Promise<CreateWorkerRouteResult> => {
  return fetcher<CreateWorkerRouteResult>(`zones/${zoneId}/workers/routes`, {
    method: 'POST',
    body: JSON.stringify({
      pattern: `${hostname}/*`,
      script: service,
    }),
  })
}

type DeleteWorkerRouteResult = void

export const deleteWorkerRoute = async (
  fetcher: CloudflareFetcher,
  zoneId: string,
  id: string
): Promise<DeleteWorkerRouteResult> => {
  return fetcher<DeleteWorkerRouteResult>(
    `zones/${zoneId}/workers/routes/${id}`,
    { method: 'DELETE' }
  )
}

export const getExpectedCustomDomainDNSRecords = (
  customHostname: string,
  current: CustomDomainDNSRecords,
  ctx: Context
): CustomDomainDNSRecords => {
  const expected: CustomDomainDNSRecords = [
    {
      name: customHostname,
      record_type: 'CNAME',
      expected_value: new URL(ctx.env.PASSPORT_URL).hostname,
    },
    {
      record_type: 'CNAME',
      name: `${ctx.env.INTERNAL_DKIM_SELECTOR}._domainkey.${customHostname}`,
      expected_value: `${ctx.env.INTERNAL_DKIM_SELECTOR}._domainkey.notifications.rollup.id`,
    },
    {
      record_type: 'CNAME',
      name: `_dmarc.${customHostname}`,
      expected_value: `_dmarc.notifications.rollup.id`,
    },
    {
      record_type: 'TXT',
      name: `_mailchannels.${customHostname}`,
      required: false,
      expected_value: 'v=mc1 cfid=rollup.id',
    },
  ]

  if (current.length == 0) return expected

  const missing: CustomDomainDNSRecords = []

  for (const e of expected) {
    const found = current.some((c) => {
      const name = e.name === c.name
      const recordType = e.record_type === c.record_type
      const expectedValue = e.expected_value === e.expected_value
      return name && recordType && expectedValue
    })
    if (!found) missing.push(e)
  }

  return current.concat(missing)
}
