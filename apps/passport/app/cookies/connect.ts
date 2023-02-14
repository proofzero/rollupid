import { createCookie } from '@remix-run/cloudflare'

export const connect = createCookie('PASSPORT_CONNECT_ACCOUNT', {
  // Is 2 minutes a good max age?
  maxAge: 120,
})

export const clearConnect = createCookie('PASSPORT_CONNECT_ACCOUNT', {
  maxAge: 0,
})
