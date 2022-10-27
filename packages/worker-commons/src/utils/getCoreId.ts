import * as jose from 'jose'

import { CoreWorkerEnvironment } from '../routers/core'

export default async (
  request: Request,
  env: CoreWorkerEnvironment
): Promise<DurableObjectId | null> => {
  const { Core } = env
  const authentication = request.headers.get('KBT-Access-JWT-Assertion')
  if (authentication) {
    const payload = jose.decodeJwt(authentication)
    if (payload.iss) {
      return Core.idFromString(payload.iss)
    }
  }

  return null
}
