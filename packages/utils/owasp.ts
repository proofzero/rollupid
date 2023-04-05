const securityHeaders = (
  nonce: string,
  dev = false,
  cspFn: (nonce: string, dev: boolean) => string
): Headers => {
  const owaspHeaders = new Headers()

  owaspHeaders.set('Content-Security-Policy', cspFn(nonce, dev))
  owaspHeaders.set('Cross-Origin-Embedder-Policy', 'same-origin')
  owaspHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')
  owaspHeaders.set('Cross-Origin-Resource-Policy', 'same-origin')
  owaspHeaders.set('Origin-Agent-Cluster', '?1')
  owaspHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  owaspHeaders.set('X-Content-Type-Options', 'nosniff')
  owaspHeaders.set('X-DNS-Prefetch-Control', 'off')
  owaspHeaders.set('X-Download-Options', 'noopen')
  owaspHeaders.set('X-Permitted-Cross-Domain-Policies', 'none')
  owaspHeaders.set('X-Frame-Options', 'DENY')
  owaspHeaders.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(self), payment=(), sync-xhr=(), accelerometer=(), usb=()'
  )
  owaspHeaders.set(
    'Strict-Transport-Security',
    'max-age=34560000; includeSubDomains; preload'
  )

  return owaspHeaders
}

export const addSecurityHeaders = (
  headers: Headers,
  nonce: string,
  dev = false,
  cspFn: (nonce: string, dev: boolean) => string
): Headers => {
  const owaspHeaders = securityHeaders(nonce, dev, cspFn)

  owaspHeaders.forEach((value, key) => {
    headers.set(key, value)
  })

  return headers
}
