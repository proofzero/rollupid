import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'
import { NonceContext } from '@proofzero/design-system/src/atoms/contexts/nonce-context'

import { addSecurityHeaders } from '@proofzero/utils/owasp'
import {
  DATA,
  getCSP,
  NONE,
  SELF,
  STRICT_DYNAMIC,
  UNSAFE_INLINE,
} from 'csp-header'

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

  // TODO: add service bindings to request context
  addSecurityHeaders(
    responseHeaders,
    cspNonce,
    process.env.NODE_ENV === 'development',
    (nonce, dev) =>
      getCSP({
        directives: {
          'default-src': [SELF],
          'connect-src': [
            SELF,
            '*.google-analytics.com',
            'https://upload.imagedelivery.net',
            // Used for Remix WebSocket Live Reaload
            ...(dev ? ['ws://localhost:*/socket'] : []),
          ],
          'script-src': [SELF, `'nonce-${nonce}' ${STRICT_DYNAMIC}`],
          'style-src': [SELF, UNSAFE_INLINE, 'fonts.cdnfonts.com'],
          'img-src': [dev ? 'http:' : 'https:', DATA],
          'font-src': [SELF, 'fonts.cdnfonts.com'],
          'object-src': [NONE],
          'base-uri': [SELF],
          'form-action': [SELF],
          'frame-ancestors': [SELF],
        },
      })
  )
  responseHeaders.set('Content-Type', 'text/html')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
