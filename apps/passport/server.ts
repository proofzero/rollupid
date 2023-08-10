import { createRequestHandler } from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

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

  let response
  try {
    console.debug(`Before requestHandler call`)
    response = await requestHandler(event)
  } finally {
    console.log('done')
  }

  return response
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
        bypassCache: false, //<- Erwin
        edgeTTL: 31536000,
        browserTTL: 31536000,
      }
    } else {
      // Assets are not necessarily hashed in the request URL, so we cannot cache in the browser
      // But they are hashed in KV storage, so we can cache on the edge
      cacheControl = {
        bypassCache: false, //<- Erwin
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
