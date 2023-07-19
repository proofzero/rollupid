import { setCORSHeaders } from '../utils'

const API_HOST = 'app.posthog.com'

type MinimalEvent = {
  request: Request
  waitUntil: ExecutionContext['waitUntil']
}

async function handleRequest(event: MinimalEvent) {
  const pathname = new URL(event.request.url).pathname
  if (pathname.startsWith('/static/')) {
    return retrieveStatic(event, pathname)
  } else {
    return forwardRequest(event, pathname)
  }
}

async function retrieveStatic(event: MinimalEvent, pathname: string) {
  let response = await caches.default.match(event.request)
  if (!response) {
    response = await fetch(`https://${API_HOST}${pathname}`)
    event.waitUntil(caches.default.put(event.request, response.clone()))
  }
  setCORSHeaders(response, event.request.headers.get('Origin') as string)
  return response
}

async function forwardRequest(event: MinimalEvent, pathname: string) {
  const request = new Request(event.request)
  request.headers.delete('cookie')
  let response = await fetch(`https://${API_HOST}${pathname}`, request)

  response = new Response(response.body, response)
  setCORSHeaders(response, request.headers.get('Origin') as string)

  return response
}

export default {
  async fetch(req: Request, env: unknown, ctx: ExecutionContext) {
    const event: MinimalEvent = {
      request: req,
      waitUntil: ctx.waitUntil.bind(ctx),
    }
    return await handleRequest(event)
  },
}
