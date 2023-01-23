import { createEventHandler } from '@remix-run/cloudflare-workers'
import * as build from '@remix-run/dev/server-build'
import { getUserSession } from './app/session.server'
import { parseParams } from './app/auth.server'

addEventListener(
  'fetch',
  createEventHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext: (event) => {
      // const session = await getUserSession(event.request)
      return {
        consoleParams: parseParams(event.request),
        // session: session,
        // jwt: session.get('jwt'),
      }
    },
  })
)
