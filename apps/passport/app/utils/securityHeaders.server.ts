import { getCSP, SELF, STRICT_DYNAMIC, UNSAFE_INLINE, DATA } from 'csp-header'

const contentSecurityPolicy = (nonce: string, dev: boolean = false): string => {
  return getCSP({
    directives: {
      'default-src': [SELF],
      'connect-src': [
        SELF,
        'wss://*.bridge.walletconnect.org',
        '*.alchemyapi.io',
        // Used for Remix WebSocket Live Reaload
        ...(dev ? ['ws://localhost:*/socket'] : []),
      ],
      'script-src': [SELF, `'nonce-${nonce}' ${STRICT_DYNAMIC}`],
      'style-src': [SELF, UNSAFE_INLINE, 'fonts.cdnfonts.com'],
      'img-src': [SELF, DATA, 'imagedelivery.net'],
      'font-src': [SELF, 'fonts.cdnfonts.com'],
      'object-src': [SELF],
      'base-uri': [SELF],
    },
  })
}

export const securityHeaders = (
  nonce: string,
  dev: boolean = false
): Headers => {
  const owaspHeaders = new Headers()

  owaspHeaders.set('Content-Security-Policy', contentSecurityPolicy(nonce, dev))
  owaspHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
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
  dev: boolean = false
): Headers => {
  const owaspHeaders = securityHeaders(nonce, dev)

  owaspHeaders.forEach((value, key) => {
    headers.set(key, value)
  })

  return headers
}
