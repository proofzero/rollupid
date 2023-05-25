import { InternalServerError } from '@proofzero/errors'

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

type GetCustomHostnameResult = CustomHostname

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
