import { createEventHandler } from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'
import { getUserSession } from './app/session.server'

addEventListener(
  'fetch',
  createEventHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (event) => {
      // const session = await getUserSession(event.request)
      return {
        searchParams: new URL(event.request.url).searchParams,
        // session: session,
        // jwt: session.get('jwt'),
      }
    },
  })
)
