import { GraphQLYogaError } from '@graphql-yoga/common'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'

import { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'

// 404: 'USER_NOT_FOUND' as string,
export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

export const setupContext = () => (next) => (root, args, context, info) => {
  const jwt = context.request.headers.get('KBT-Access-JWT-Assertion')
  const parsedJwt = jwt && parseJwt(jwt)
  const accountURN: AccountURN = parsedJwt && parsedJwt.sub

  return next(root, args, { ...context, jwt, accountURN }, info)
}

export const isAuthorized = () => (next) => (root, args, context, info) => {
  // TODO: update to check if user is authorized with authorzation header
  if (!context.jwt) {
    throw new GraphQLYogaError('You are not authenticated!', {
      extensions: {
        http: {
          status: 401,
        },
      },
    })
  }

  return next(root, args, context, info)
}

export async function checkHTTPStatus(response: Response) {
  if (response.status !== 200) {
    const json: { error: string } = await response.json()
    throw new GraphQLYogaError(
      `Error: ${response.status} ${response.statusText}: ${json.error}`,
      {
        extensions: {
          http: {
            status: response.status,
          },
        },
      }
    )
  }
}

export async function getRPCResult(response: Response) {
  const json: {
    error?: { message: string; code: string }
    result?: { value: any }
  } = await response.json()
  if (json.error) {
    // TODO: we should get proper error codes from the RPC
    let status = parseInt(json.error.code) > 0 ? json.error.code : 400
    switch (json.error.message) {
      case 'cannot authorize':
        status = 401
        break
    }
    throw new GraphQLYogaError(
      `Error: ${json.error?.code} ${json.error?.message}`,
      {
        extensions: {
          http: {
            status,
          },
        },
      }
    )
  }
  return json.result?.value
}

export async function upgrayeddOortToAccount(
  accountURN: AccountURN,
  name: string,
  accountClient: AccountApi,
  oortResponse
) {
  if (!(accountURN && accountClient && oortResponse)) return {}

  console.log(`Migrating core ${accountURN} to Account service... starting`)

  try {
    await checkHTTPStatus(oortResponse)

    const oortProfile = await getRPCResult(oortResponse)

    console.log({ oortProfile })

    if (!oortProfile) {
      console.log(
        `Migrating core ${accountURN} to Account service... no profile`
      )
      return {}
    }

    const profileRes = await accountClient.kb_setProfile(accountURN, {
      ...oortProfile,
      defaultAddress: AddressURNSpace.urn(name),
    })

    if (!profileRes) {
      throw `Migrating core ${accountURN} to Account service... failed`
    }

    console.log(`Migrating core ${accountURN} to Account service... complete`)
    return oortProfile
  } catch (err) {
    console.error(err)
  }
}
