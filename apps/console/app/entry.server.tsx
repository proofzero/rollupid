/**
 * @file app/entry.server.tsx
 */

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

  addSecurityHeaders(
    responseHeaders,
    cspNonce,
    process.env.NODE_ENV === 'development',
    (nonce, dev) =>
      getCSP({
        directives: {
          'default-src': [
            SELF,
            'https://verify.walletconnect.com',
            'form.typeform.com',
            'https://*.stripe.com',
          ],
          'connect-src': [
            SELF,
            '*.google-analytics.com',
            'wss://relay.walletconnect.com',
            'https://*.g.alchemy.com',
            'https://upload.imagedelivery.net',
            'https://analytics.rollup.id',
            'https://maps.googleapis.com',
            'https://api.stripe.com',
            // Used for Remix WebSocket Live Reaload
            ...(dev ? ['ws://localhost:*/socket'] : []),
          ],
          'frame-src': [
            SELF,
            'https://js.stripe.com',
            'https://hooks.stripe.com',
            'form.typeform.com',
          ],
          'script-src': [SELF, `'nonce-${nonce}' ${STRICT_DYNAMIC}`],
          'style-src': [
            SELF,
            UNSAFE_INLINE,
            'fonts.cdnfonts.com',
            'fonts.googleapis.com',
          ],
          'img-src': [dev ? 'http:' : 'https:', DATA, 'blob:'],
          'font-src': [
            SELF,
            'fonts.cdnfonts.com',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
          ],
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
