import { withCors } from './cors'

export const discoveryHandler =
  (description: object): ((request: Request) => Response) =>
  (request: Request): Response => {
    const response = new Response(JSON.stringify(description, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    })
    withCors(request, response)
    return response
  }
