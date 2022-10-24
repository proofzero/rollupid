import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import Address from './address'
import Core from './core'
import coreRouter from './routes/core'
import threeIdRouter from './routes/threeid'
import { handleOptions, withCors } from './utils/cors'

const fallback = async (request: Request) => {
  const response = error(404, 'not found')
  withCors(request, response)
  return response
}

const index = Router()
  .all('/invite/*', handleOptions(), threeIdRouter)
  .all('*', handleOptions(), coreRouter, fallback)

export { Address, Core }
export default { fetch: index.handle }
