import { createEventHandler } from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'

export function parseParams(request) {
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')
  const redirectUri = url.searchParams.get('redirect_uri')
  const scope = url.searchParams.get('scope')

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
  }
}

addEventListener(
  'fetch',
  createEventHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (event) => {
      return {
        consoleParams: parseParams(event.request),
        env: global, // or globalThis?
      }
    },
  })
)
