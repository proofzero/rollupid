import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

const requestHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
})

const handleEvent = async (event) => {
  const startTime = Date.now()

  let response = await handleAsset(event, build)

  if (!response) {
    const reqURL = new URL(event.request.url)
    console.debug(
      `TRACE: B${startTime} Starting handler for ${reqURL.pathname}/${reqURL.searchParams}`
    )
    try {
      response = await requestHandler(event)
    } finally {
      console.debug(
        `TRACE: B${startTime} Completed handler for ${reqURL.pathname}/${
          reqURL.searchParams
        } in ${Date.now() - startTime}ms`
      )
    }
  }

  return response
}

addEventListener('fetch', async (event) => {
  event.respondWith(handleEvent(event))
})
