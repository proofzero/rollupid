import { Router } from 'itty-router'

import AlchemyHandler from './handlers/alchemy'

const router = Router()
router
  .get('/webhooks/alchemy', AlchemyHandler)
  .get('*', () => new Response('Not found', { status: 404 }))

export const handleRequest = (request: Request) => router.handle(request)
