import { createCookie } from '@remix-run/cloudflare'

export const connect = createCookie('connect', {
  maxAge: 120,
})

export const clearConnect = createCookie('connect', {
  maxAge: 0,
})
