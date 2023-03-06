import {
  generateTraceSpan,
  TraceableFetchEvent,
} from '@kubelt/platform-middleware/trace'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

export function parseParams(request: Request) {
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')
  const redirectUri = url.searchParams.get('redirect_uri')
  const scope = url.searchParams.get('scope')
  const prompt = url.searchParams.get('prompt')

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
  }
}

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (event) => {
    const traceSpan = (event as TraceableFetchEvent).traceSpan
    return {
      consoleParams: parseParams(event.request),
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
      `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams} span: ${newTraceSpan}`
    )
    try {
      response = await requestHandler(newEvent)
    } finally {
      console.debug(
        `Completed HTTP handler for ${reqURL.pathname}/${reqURL.searchParams} span ${newTraceSpan}`
      )
    }
  }

  return response
}

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(handleEvent(event))
})
