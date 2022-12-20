import { Router } from 'itty-router'

import moarlis from './handlers/moralis'

const router = Router()
router
  .post('/webhooks/moralis', moarlis)
  .get('*', () => new Response('Not found', { status: 404 }))

export const handleRequest = (request: Request) => router.handle(request)
