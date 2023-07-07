import { setCORSHeaders } from '../utils'

const API_HOST = 'app.posthog.com'

type ExtendableEventWithRequest = ExtendableEvent & { request: Request }

async function handleRequest(event: ExtendableEventWithRequest) {
  const pathname = new URL(event.request.url).pathname
  if (pathname.startsWith('/static/')) {
    return retrieveStatic(event, pathname)
  } else {
    return forwardRequest(event, pathname)
  }
}

async function retrieveStatic(
  event: ExtendableEventWithRequest,
  pathname: string
) {
  let response = await caches.default.match(event.request)
  if (!response) {
    response = await fetch(`https://${API_HOST}${pathname}`)
    event.waitUntil(caches.default.put(event.request, response.clone()))
  }
  setCORSHeaders(response, event.request.headers.get('Origin') as string)
  return response
}

async function forwardRequest(
  event: ExtendableEventWithRequest,
  pathname: string
) {
  const request = new Request(event.request)
  request.headers.delete('cookie')
  let response = await fetch(`https://${API_HOST}${pathname}`, request)

  response = new Response(response.body, response)
  setCORSHeaders(response, request.headers.get('Origin') as string)

  return response
}

addEventListener('fetch', (event) => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event))
})
