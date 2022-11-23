import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import { Context } from '../../types'
import getPackages from '../../packages'
import Core from '../../core'
import Auth from '../../packages/auth/auth'
import { JWTPayload } from '../../packages/auth/types'

import { CoreRequest } from './types'

import * as jose from 'jose'

const getClaims = async (
  request: CoreRequest,
  auth: Auth
): Promise<JWTPayload | null> => {
  if (request.headers.has('KBT-Access-JWT-Assertion')) {
    const jwt = request.headers.get('KBT-Access-JWT-Assertion')
    const payload = jose.decodeJwt(jwt)
    // const { payload } = await auth.verifyJWT(
    //   request.headers.get('KBT-Access-JWT-Assertion')
    // )
    return payload
  }
  return null
}

const handle = async (
  core: Core,
  request: CoreRequest
): Promise<void | Response> => {
  const address = request.headers.get('KBT-Core-Address')
  const packages = getPackages(core)

  const context: Partial<Context> = {
    core,
    address,
    packages,
  }

  try {
    context.claims = await getClaims(request, packages.auth)
  } catch (err) {
    console.error(err)
    if (err.code == 'ERR_JWT_EXPIRED') {
      return error(401, 'token expired')
    } else {
      return error(401, 'unexpected error')
    }
  }

  request.coreContext = context as Context
}

export default (core: Core) => {
  const router = Router()
  router.all('*', (request: Request) => handle(core, request as CoreRequest))
  return router
}
