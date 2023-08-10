import type { Request as CfRequest } from '@cloudflare/workers-types'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

import createCoreClient from '@proofzero/platform-clients/core'
import {
  TraceSpan,
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
import { ServerBuild } from '@remix-run/cloudflare'

let manifest = JSON.parse(manifestJSON)

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
  const reqURL = new URL(event.request.url)

  console.debug(
    `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams}`
  )

  const request = event.request as unknown as CfRequest<CfHostMetadata>
  const host = request.headers.get('host') as string
  if (!env.DEFAULT_HOSTS.includes(host)) {
    const clientId = request.cf?.hostMetadata?.clientId
    if (!clientId) return new Response(null, { status: 404 })
    const coreClient = createCoreClient(env.Core, {})

    try {
      console.debug(`Before getAppProps`)
      const app = await coreClient.starbase.getAppPublicProps.query({
        clientId,
      })
      event.request.app_props = app
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
        traceSpan: generateTraceSpan(),
      }
    },
  })

  let response
  try {
    console.debug(`Before requestHandler call`)
    response = await requestHandler(event)
  } finally {
    console.debug(
      `Completed HTTP handler ${
        response?.status && response?.status >= 400 && response?.status <= 599
          ? 'with errors '
          : ''
      }for ${reqURL.pathname}/${reqURL.searchParams}`
    )
  }

  return response
}

const config: ResolveConfigFn = (env: Env, _trigger) => {
  return {
    exporter: {
      url: 'https://api.honeycomb.io/v1/traces',
      headers: { 'x-honeycomb-team': env.SECRET_HONEYCOMB_API_KEY },
    },
    service: { name: 'passport' },
  }
}

export async function manuallyHandleAsset(
  event: FetchEvent,
  build: ServerBuild,
  options?: any
) {
  try {
    if (process.env.NODE_ENV === 'development') {
      return await getAssetFromKV(event, {
        cacheControl: {
          bypassCache: true,
        },
        ...options,
      })
    }

    let cacheControl = {}
    let url = new URL(event.request.url)
    let assetpath = build.assets.url.split('/').slice(0, -1).join('/')
    let requestpath = url.pathname.split('/').slice(0, -1).join('/')

    if (requestpath.startsWith(assetpath)) {
      // Assets are hashed by Remix so are safe to cache in the browser
      // And they're also hashed in KV storage, so are safe to cache on the edge
      cacheControl = {
        bypassCache: true,
        edgeTTL: 31536000,
        browserTTL: 31536000,
      }
    } else {
      // Assets are not necessarily hashed in the request URL, so we cannot cache in the browser
      // But they are hashed in KV storage, so we can cache on the edge
      cacheControl = {
        bypassCache: true,
        edgeTTL: 31536000,
      }
    }

    return await getAssetFromKV(event, {
      cacheControl,
      ...options,
    })
  } catch (error: unknown) {
    if (
      error instanceof MethodNotAllowedError ||
      error instanceof NotFoundError
    ) {
      return null
    }

    throw error
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

      let response = await manuallyHandleAsset(event, build, {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: manifest,
      })

      if (response) return response

      return await handleEvent(event, env)
    },
  },
  config
)
