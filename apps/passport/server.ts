import {
  generateTraceSpan,
  TraceableFetchEvent,
} from '@proofzero/platform-middleware/trace'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

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

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (event) => {
    const traceSpan = (event as TraceableFetchEvent).traceSpan
    return {
      authzQueryParams: parseParams(event.request),
      env: globalThis as unknown as Env,
      traceSpan,
    }
  },
})

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build)

  if (!response) {
    //Create a new trace span with no parent
    const newTraceSpan = generateTraceSpan()

    const reqURL = new URL(event.request.url)
    //Have to force injection of new field so it is available in the context setup above
    const newEvent = Object.assign(event, { traceSpan: newTraceSpan })

    console.debug(
      `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams}`,
      newTraceSpan.toString()
    )
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
  }

  return response
}

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(handleEvent(event))
})
