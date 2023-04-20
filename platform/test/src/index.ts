import { RequestLike, Router } from 'itty-router'
import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import type { Environment, CloudflareEmailMessage } from './types'

const router = Router() // no "new", as this is not a real class

// register a route on the "GET" method
router.get('/otp/:email', (req) => {
  const { params, query } = req

  console.log({ params, query })
})

// alternative advanced/manual approach for downstream control
export default {
  fetch: (request: RequestLike, env: Environment, context: any) =>
    router
      .handle(request, env, context)
      .then((response) => {
        // can modify response here before final return, e.g. CORS headers

        return response
      })
      .catch((err) => {
        // and do something with the errors here, like logging, error status, etc
      }),

  async email(message: CloudflareEmailMessage, env: Environment) {
    //TODO: Implement email masking
    //This is where you'd receive an email, check destination
    //address, lookup unmasked address and forward
  },
}
