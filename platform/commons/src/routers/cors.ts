export type Options = {
  origin: string
  methods: string[]
  headers: string[]
  credentials: boolean
}

export const defaultOptions: Options = {
  origin: '*',
  methods: ['HEAD', 'OPTIONS', 'GET', 'POST', 'PATCH', 'DELETE'],
  headers: ['authorization', 'referer', 'origin', 'content-type'],
  credentials: false,
}

export const handleOptions =
  (options: Partial<Options> = defaultOptions) =>
  (request: Request) => {
    if (request.method !== 'OPTIONS') {
      return
    }

    options = { ...defaultOptions, ...options }
    const { origin, methods, headers, credentials } = options

    if (request.headers.get('Access-Control-Request-Method')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Credentials': String(credentials),
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': headers?.join(', '),
          'Access-Control-Allow-Methods': methods?.join(', '),
        } as HeadersInit,
      })
    }

    return new Response(null, {
      headers: {
        allow: methods?.join(', '),
      } as HeadersInit,
    })
  }

export const withCors = (request: Request, response: Response) => {
  const origin = request.headers.get('origin')
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Vary', 'Origin')
  }
}
