import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'
import type {
  TraceableFetchEvent,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import { generateTraceSpan } from '@proofzero/platform-middleware/trace'

//Extending the remix untyped AppLoadContext with the type
//we inject into the context
declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    traceSpan: TraceSpan
  }
}

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (event) => {
    const traceSpan = (event as TraceableFetchEvent).traceSpan
    return {
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
