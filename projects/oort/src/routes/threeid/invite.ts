import { Request as IttyRequest, Router } from 'itty-router'
import { error } from 'itty-router-extras'

import { withCors } from '../../utils/cors'

const submitCode = async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Core, THREEID_INVITE_CODES } = env
  const { code } = (request as IttyRequest).params || {}

  let coreId: string
  if (code) {
    coreId = await THREEID_INVITE_CODES.get(code)
  }
  if (!code && !coreId) {
    coreId = Core.newUniqueId().toString()
  }

  try {
    const url = new URL(`/invite/submit/${code || ''}`, request.url)
    request = new Request(url.toString(), request)
    let response = await Core.get(Core.idFromString(coreId)).fetch(request)
    response = new Response(response.body, response)
    withCors(request, response)
    return response
  } catch (err) {
    console.error(err)
    const response = error(500)
    withCors(request, response)
    return response
  }
}

const router = Router({ base: '/invite' })
  .post('/submit/:code', submitCode)
  .post('/submit/', submitCode)

export default router
