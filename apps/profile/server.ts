import { generateTraceSpan, TraceSpan } from '@kubelt/platform-middleware/trace'
import { TraceableFetchEvent } from '@kubelt/platform-middleware/TraceableFetchEvent'
import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

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
    const modifiedEvent = new TraceableFetchEvent(
      'FetchEvent',
      event,
      newTraceSpan
    )

    console.debug(
      `Started HTTP handler for ${reqURL.pathname}/${reqURL.searchParams} span: ${newTraceSpan}`
    )
    try {
      response = await requestHandler(modifiedEvent)
    } finally {
      console.debug(
        `Completed HTTP handler for ${reqURL.pathname}/${reqURL.searchParams} span: ${newTraceSpan}`
      )
    }
  }

  return response
}

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(handleEvent(event))
})
