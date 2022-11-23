import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import { isAddress as isEthAddress } from '@ethersproject/address'

import * as jose from 'jose'

import {
  defaultOptions as defaultCorsOptions,
  handleOptions,
  withCors,
} from '../../utils/cors'

import { CoreRequest } from './types'

const optionsHandler = handleOptions({
  headers: [...defaultCorsOptions.headers, 'kbt-access-jwt-assertion'],
})

const withCore = async (
  request: CoreRequest,
  env: Environment
): Promise<void | Response> => {
  const { Address, Core } = env

  const coreId = request.headers.get('KBT-Core-Id')
  if (coreId) {
    request.core = Core.get(Core.idFromString(coreId))
    return
  }

  let address = request.headers.get('KBT-Core-Address')
  if (!address && request.headers.has('KBT-Access-JWT-Assertion')) {
    const token = request.headers.get('KBT-Access-JWT-Assertion')
    const payload = jose.decodeJwt(token)
    const coreId = payload.iss
    request.core = Core.get(Core.idFromString(coreId))
    return
  } else if (!address) {
    return error(400, 'no address')
  }

  let type: string
  if (isEthAddress(address)) {
    type = 'eth'
  } else if (address.endsWith('.eth')) {
    // TODO: stop gap unti we can sort out lookupName with ethers on worker
    // this only works for mainnet so it needs to be replaced
    const ensRes = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`
    )
    const res: { address: string } = await ensRes.json()
    if (!res?.address) {
      return error(404, 'not found')
    }
    address = res?.address
    type = 'eth'
  } else {
    return error(400, 'unsupported address type')
  }

  const client = Address.get(Address.idFromName(address))
  const response = await client.fetch(`http://localhost/${type}/${address}`)
  if (response.ok) {
    const { coreId }: { coreId: string } = await response.json()
    request.core = Core.get(Core.idFromString(coreId))
    return
  } else if (response.status == 404) {
    if (type != 'eth') {
      // TODO: remove this since we convert to eth above
      return error(400, 'address type cannot be used to create a core')
    }

    const core = Core.get(Core.newUniqueId())
    const coreId = core.id.toString()
    const response = await client.fetch(`http://localhost`, {
      method: 'POST',
      body: JSON.stringify({ type, address, coreId }),
    })

    if (response.ok) {
      request.core = Core.get(Core.idFromString(coreId))
      return
    } else {
      return response
    }
  } else {
    return response
  }
}

const handler = async (request: CoreRequest): Promise<Response> => {
  let response = await request.core.fetch(request)
  response = new Response(response.body, response)
  withCors(request, response)
  return response
}

const router = Router().all('*', optionsHandler, withCore, handler)

export default router.handle
