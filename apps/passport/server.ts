import type { Request as CfRequest } from '@cloudflare/workers-types'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

import createStarbaseClient from '@proofzero/platform-clients/starbase'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'
import type { TraceableFetchEvent } from '@proofzero/platform-middleware/trace'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'

type CfHostMetadata = {
  clientId: string
}

export function parseParams(
  request: Request & { app_props?: GetAppPublicPropsResult }
) {
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id') || ''
  const state = url.searchParams.get('state') || ''
  const redirectUri = url.searchParams.get('redirect_uri') || ''
  const scope = url.searchParams.get('scope')
  //Optional params get a default value of undefined
  const prompt = url.searchParams.get('prompt') || undefined
  const login_hint = url.searchParams.get('login_hint') || undefined
  const rollup_action = url.searchParams.get('rollup_action') || undefined
  const rollup_result = url.searchParams.get('rollup_result') || undefined
  const app_props = request.app_props || undefined

  const decodedScope =
    scope &&
    scope.trim() !== '' &&
    scope.trim() !== 'null' &&
    decodeURIComponent(scope)

  return {
    clientId,
    state,
    redirectUri,
    scope: decodedScope ? decodedScope.split(' ') : [],
    prompt,
    login_hint,
    rollup_action,
    rollup_result,
    app_props: app_props,
  }
}

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (event) => {
    const authzQueryParams = parseParams(event.request)
    const env = globalThis as unknown as Env
    const traceSpan = (event as TraceableFetchEvent).traceSpan
    return {
      authzQueryParams,
      env,
      traceSpan,
    }
  },
})

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build)
  if (response) return response

  //Create a new trace span with no parent
  const newTraceSpan = generateTraceSpan()

  const reqURL = new URL(event.request.url)
  //Have to force injection of new field so it is available in the context setup above
  const newEvent = Object.assign(event, { traceSpan: newTraceSpan })

  console.debug(
    `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams}`,
    newTraceSpan.toString()
  )

  const env = globalThis as unknown as Env
  const request = event.request as unknown as CfRequest<CfHostMetadata>
  const host = request.headers.get('host') as string
  if (!env.DEFAULT_HOSTS.includes(host)) {
    const clientId = request.cf?.hostMetadata?.clientId
    if (!clientId) return new Response(null, { status: 404 })
    const starbaseClient = createStarbaseClient(
      env.Starbase,
      generateTraceContextHeaders(newTraceSpan)
    )

    try {
      const app = await starbaseClient.getAppPublicProps.query({ clientId })
      newEvent.request.app_props = app
      const { customDomain } = app
      if (!customDomain) return new Response(null, { status: 404 })
      if (!customDomain.isActive || host !== customDomain?.hostname)
        return new Response(null, { status: 404 })
    } catch (error) {
      return new Response(null, { status: 500 })
    }
  }

  try {
    response = await requestHandler(newEvent)
  } finally {
    console.debug(
      `Completed HTTP handler ${
        response?.status && response?.status >= 400 && response?.status <= 599
          ? 'with errors '
          : ''
      }for ${reqURL.pathname}/${reqURL.searchParams}`,
      newTraceSpan.toString()
    )
  }

  return response
}

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(handleEvent(event))
})
