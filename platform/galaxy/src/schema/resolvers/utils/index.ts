import { GraphQLYogaError } from '@graphql-yoga/common'

import { OortJwt } from '../clients/oort'

// 404: 'USER_NOT_FOUND' as string,
export function parseJwt(token: string): OortJwt {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}

export const setupContext = () => (next) => (root, args, context, info) => {
  const jwt = context.request.headers.get('KBT-Access-JWT-Assertion')
  const parsedJwt = jwt && parseJwt(jwt)
  const coreId = parsedJwt && parsedJwt.iss
  return next(root, args, { ...context, jwt, coreId }, info)
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
    console.log('json status', json)
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
  console.log('json', json)

  if (json.error) {
    // TODO: we should get proper error codes from the RPC
    let status = parseInt(json.error.code) > 0 ? json.error.code : 400
    console.log('json.error', json.error)
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
