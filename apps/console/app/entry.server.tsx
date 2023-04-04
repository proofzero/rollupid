/**
 * @file app/entry.server.tsx
 */

import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'
import { NonceContext } from './components/nonce-context'
import { addSecurityHeaders } from './utils/securityHeaders.server'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const cspNonce = crypto.randomUUID()

  const markup = renderToString(
    <NonceContext.Provider value={cspNonce}>
      <RemixServer context={remixContext} url={request.url} />
    </NonceContext.Provider>
  )

  addSecurityHeaders(
    responseHeaders,
    cspNonce,
    process.env.NODE_ENV === 'development'
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
