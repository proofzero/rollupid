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
    `default-src 'self' ws://localhost; img-src 'self' https://imagedelivery.net; script-src 'self' 'unsafe-hashes' 'sha256-TcaXRmbbVF2Zj8dP7F686KhWS6LWiRJ1xP9Kb7/W08w=' 'sha256-NSm+hBs2RlxPZ6wzztFK5YgO63Ygr3Djb6CMwJWTVmk=' 'sha256-ynBky1t959ZQuTs/L4fr86nS6LrMXIOBelCH46+8ck8=' 'sha256-I1Mo+9iywJ+8LVeO44zX6hweed+fpFCO2XQ+5eecwzk=' 'sha256-lBBUsU+pFUczvmcrJiwgRCPoztSsFFseU8Qtl5JLtbQ=' 'sha256-nYXi20p1CPz5mn/UxWlwFMP8qHKXg4nu1bHsOSdHK20=' https://unpkg.com/flowbite@1.5.4/dist/flowbite.js https://www.googletagmanager.com/gtag/js; style-src 'self' 'unsafe-hashes' 'sha256-52Nb6Bp41pzwAjjJQY2U/gglkabnPpAw0XtttCNePfE=' 'sha256-dyzCnHa/jBIBK24sOTThWknRfCH9dOwxEfkI5ncCmjA=' 'sha256-yMILKR5/JGClhkW3nxN4tDDdEqphz9+qtpUxKK4pbVU=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-Nqnn8clbgv+5l0PgxcTOldg8mkMKrFn4TvPL+rYUUGg=' 'sha256-13vrThxdyT64GcXoTNGVoRRoL0a7EGBmOJ+lemEWyws=' 'sha256-QZ52fjvWgIOIOPr+gRIJZ7KjzNeTBm50Z+z9dH4N1/8=' 'sha256-yOU6eaJ75xfag0gVFUvld5ipLRGUy94G17B1uL683EU=' 'sha256-OpTmykz0m3o5HoX53cykwPhUeU4OECxHQlKXpB0QJPQ=' 'sha256-SSIM0kI/u45y4gqkri9aH+la6wn2R+xtcBj3Lzh7qQo=' 'sha256-ZH/+PJIjvP1BctwYxclIuiMu1wItb0aasjpXYXOmU0Y=' 'sha256-58jqDtherY9NOM+ziRgSqQY0078tAZ+qtTBjMgbM9po=' 'sha256-7Ri/I+PfhgtpcL7hT4A0VJKI6g3pK0ZvIN09RQV4ZhI=' https://fonts.cdnfonts.com; font-src https://fonts.cdnfonts.com; connect-src 'self' wss://*.walletconnect.org ws://localhost:*/socket https://*.alchemyapi.io;`
  )

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
