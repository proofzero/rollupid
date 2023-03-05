import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
  TRACEPARENT_HEADER_NAME,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

//Extending the remix untyped AppLoadContext with the type
//we inject into the context
declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    traceSpan: TraceSpan
  }
}

class ModifyableFetchEvent extends FetchEvent {
  request: Request
  constructor(
    type: string,
    eventInitDict: EventInit,
    modifiedRequest: Request
  ) {
    super(type, eventInitDict)
    this.request = modifiedRequest
  }
}

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (event) => {
    const newTraceSpan = generateTraceSpan(event.request.headers)
    return {
      traceSpan: newTraceSpan,
    }
  },
})

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build)

  if (!response) {
    //We fake a span from the browser and append it into the headers as
    //a trace context
    const newTraceSpan = generateTraceSpan()
    const traceparentHeader = generateTraceContextHeaders(newTraceSpan)

    const reqURL = new URL(event.request.url)
    const newRequest = new Request(reqURL, event.request)
    newRequest.headers.append(
      TRACEPARENT_HEADER_NAME,
      traceparentHeader.traceparent
    )
    const modifiedEvent = new ModifyableFetchEvent(
      'FetchEvent',
      event,
      newRequest
    )

    console.debug(
      `${newTraceSpan} Started handler for ${reqURL.pathname}/${reqURL.searchParams}`
    )
    try {
      response = await requestHandler(modifiedEvent)
    } finally {
      console.debug(
        `${newTraceSpan} Completed handler for ${reqURL.pathname}/${reqURL.searchParams}`
      )
    }
  }

  return response
}

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(handleEvent(event))
})
