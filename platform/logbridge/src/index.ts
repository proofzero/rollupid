import type { Request } from '@cloudflare/workers-types'
import type { Environment, LokiRequestPayload } from './types'
import {
  getLogpushEntriesFromRequest,
  convertLogpushEntriesToLokiStreams,
} from './transformations'

export default {
  async fetch(request: Request, env: Environment) {
    // Check pre-shared key header
    const PRESHARED_AUTH_HEADER_KEY = 'X-LOGBRIDGE-PSK'
    const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY)
    if (psk !== env.SECRET_LOGPUSH_JOB_AUTHZ_KEY) {
      return new Response('Unauthorized to use Logbridge.', {
        status: 403,
      })
    }

    const contentEncoding = request.headers.get('content-encoding')
    if (contentEncoding !== 'gzip') {
      return new Response(undefined, { status: 204 })
    }
    //Convert gzip batched logpush data to array of logpush entries
    const logpushEntries = await getLogpushEntriesFromRequest(request)

    //If no logs, or CF Logpush initial "handshake", then early return
    if (logpushEntries && logpushEntries.length === 0)
      return new Response(undefined, { status: 204 })

    //Convert Logpush entries to Loki ones
    const lokiPayload: LokiRequestPayload =
      convertLogpushEntriesToLokiStreams(logpushEntries)

    const result = await sendLokiStreamsToLoki(lokiPayload, env)
    return result
  },
}

async function sendLokiStreamsToLoki(
  lokiPayload: LokiRequestPayload,
  env: Environment
) {
  // Post data to Grafana Loki
  const result = await fetch(`${env.INTERNAL_LOKI_URL}/loki/api/v1/push`, {
    method: 'POST',
    body: JSON.stringify(lokiPayload),
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Basic ' + btoa(`${env.INTERNAL_LOKI_USER}:${env.SECRET_LOKI_API_KEY}`),
    },
  })
  console.log(await result.text())
  return result
}
