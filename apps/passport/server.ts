import type { Request as CfRequest } from '@cloudflare/workers-types'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

import createCoreClient from '@proofzero/platform-clients/core'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'
import type { TraceableFetchEvent } from '@proofzero/platform-middleware/trace'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'
import { ResolveConfigFn, instrument } from '@microlabs/otel-cf-workers'
import {
  MethodNotAllowedError,
  NotFoundError,
  getAssetFromKV,
} from '@cloudflare/kv-asset-handler'

let manifest = manifestJSON

type CfHostMetadata = {
  clientId: string
}

type CustomDomainRequest = Request & {
  app_props: GetAppPublicPropsResult
}

export function parseParams(request: Request) {
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
  }
}

const handleEvent = async (event: FetchEvent, env: Env) => {
  console.debug(`Handling assets for ${event.request.url}`)
  let response
  try {
    const url = new URL(event.request.url)
    const ttl = url.pathname.startsWith('/build/')
      ? 60 * 60 * 24 * 365 // 1 year
      : 60 * 5 // 5 minutes
    return await getAssetFromKV(event, {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: manifest,
      cacheControl: {
        browserTTL: ttl,
        edgeTTL: ttl,
      },
    })
  } catch (error: any) {
    console.debug(
      'ERROR',
      error,
      error.stack,
      error.name,
      error.message,
      error.cause,
      error.linenumber,
      error.filename
    )

    if (
      error instanceof MethodNotAllowedError ||
      error instanceof NotFoundError
    ) {
      return null
    }
  }

  //Create a new trace span with no parent
  const newTraceSpan = generateTraceSpan()

  const reqURL = new URL(event.request.url)
  //Have to force injection of new field so it is available in the context setup above
  const newEvent = Object.assign(event, { traceSpan: newTraceSpan })

  console.debug(
    `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams}`,
    newTraceSpan.toString()
  )

  const request = event.request as unknown as CfRequest<CfHostMetadata>
  const host = request.headers.get('host') as string
  console.debug(`Before env.DEFAULT_HOSTS`)
  if (!env.DEFAULT_HOSTS.includes(host)) {
    const clientId = request.cf?.hostMetadata?.clientId
    if (!clientId) return new Response(null, { status: 404 })
    const coreClient = createCoreClient(
      env.Core,
      generateTraceContextHeaders(newTraceSpan)
    )

    try {
      console.debug(`Before getAppProps`)
      const app = await coreClient.starbase.getAppPublicProps.query({
        clientId,
      })
      newEvent.request.app_props = app
      const { customDomain } = app
      if (!customDomain) return new Response(null, { status: 404 })
      if (!customDomain.isActive || host !== customDomain?.hostname)
        return new Response(null, { status: 404 })
    } catch (error) {
      return new Response(null, { status: 500 })
    }
  }

  const requestHandler = createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (event) => {
      const authzQueryParams = parseParams(event.request)
      const traceSpan = (event as TraceableFetchEvent).traceSpan
      return {
        authzQueryParams,
        appProps: (event.request as CustomDomainRequest).app_props,
        env,
        traceSpan,
      }
    },
  })

  try {
    console.debug(`Before requestHandler call`)
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

const config: ResolveConfigFn = (env: Env, _trigger) => {
  return {
    exporter: {
      url: 'https://api.honeycomb.io/v1/traces',
      headers: { 'x-honeycomb-team': '' },
    },
    service: { name: 'passport' },
  }
}

export default instrument(
  {
    async fetch(req: Request, env: Env, ctx: ExecutionContext) {
      //This is the smallest set of event props Remix needs to handle assets correctly
      const event = {
        request: req,
        waitUntil: ctx.waitUntil.bind(ctx),
      } as FetchEvent
      console.log(`Handling event for ${req.url}`)
      return await handleEvent(event, env)
    },
  },
  config
)
