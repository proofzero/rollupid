import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  // TODO: add service bindings to request context

  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.set(
    'Content-Security-Policy',
    `default-src 'self' ws://localhost; img-src 'self' https://imagedelivery.net; script-src 'self' 'unsafe-inline' https://unpkg.com/flowbite@1.5.4/dist/flowbite.js https://www.googletagmanager.com/gtag/js; style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; font-src https://fonts.cdnfonts.com; connect-src 'self' wss://*.walletconnect.org ws://localhost:*/socket https://*.alchemyapi.io;`
  )

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
