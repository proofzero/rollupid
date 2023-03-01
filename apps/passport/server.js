import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

export function parseParams(request) {
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
    return {
      consoleParams: parseParams(event.request),
      env: global, // or globalThis?
      reqStartTime: Date.now(),
    }
  },
})

const handleEvent = async (event) => {
  const startTime = Date.now()

  let response = await handleAsset(event, build)

  if (!response) {
    const reqURL = new URL(event.request.url)
    console.debug(
      `TRACE: B${startTime} Started handler for ${reqURL.pathname}/${reqURL.searchParams}`
    )
    response = await requestHandler(event)
    console.debug(
      `TRACE: B${startTime} Completed handler for ${reqURL.pathname}/${
        reqURL.searchParams
      } in ${Date.now() - startTime}ms`
    )
  }

  return response
}

addEventListener('fetch', async (event) => {
  event.respondWith(handleEvent(event))
})
