import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'
import { NonceContext } from './components/nonce-context'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const cspNonce = crypto.randomUUID()
  // responseHeaders.set(
  //   'Content-Security-Policy',
  //   `script-src 'nonce-${cspNonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`
  // )

  const markup = renderToString(
    <NonceContext.Provider value={cspNonce}>
      <RemixServer context={remixContext} url={request.url} />
    </NonceContext.Provider>
  )

  // TODO: add service bindings to request context

  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.set(
    'Content-Security-Policy',
    `default-src 'self' ws://localhost; img-src 'self' https://imagedelivery.net; script-src 'nonce-${cspNonce}' 'strict-dynamic'; style-src 'self' https://fonts.cdnfonts.com 'unsafe-inline'; font-src https://fonts.cdnfonts.com; connect-src 'self' wss://*.walletconnect.org ws://localhost:*/socket https://*.alchemyapi.io;`
  )

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
