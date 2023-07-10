import { json } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'

import { requireJWT } from '~/utilities/session.server'

import type {
  CustomDomainLoginProviders,
  CustomDomainLoginProviderConfigSchema,
} from '@proofzero/platform.starbase/src/jsonrpc/validators/customdomain'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { clientId, type } = params
    if (!clientId) throw new BadRequestError({ message: 'missing client id' })

    if (typeof type !== 'string')
      throw new BadRequestError({ message: 'invalid login provider type' })

    const jwt = await requireJWT(request)
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    return json(
      await starbaseClient.getCustomDomainLoginProvider.query({
        clientId,
        type: type as CustomDomainLoginProviders,
      })
    )
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { clientId, type } = params
    if (!clientId) throw new BadRequestError({ message: 'missing client id' })
    if (!type) throw new BadRequestError({ message: 'missing type' })

    const formData = await request.formData()
    const config = formData.get(
      'config'
    ) as CustomDomainLoginProviderConfigSchema

    if (!config || typeof config !== 'object')
      throw new BadRequestError({
        message: 'missing login provider configuration',
      })

    if (!config.clientId)
      throw new BadRequestError({
        message: 'missing client id',
      })

    if (!config.clientSecret)
      throw new BadRequestError({
        message: 'missing client secret',
      })

    if (!config.redirectUri)
      throw new BadRequestError({
        message: 'missing redirect uri',
      })

    const jwt = await requireJWT(request)
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    await starbaseClient.setCustomDomainLoginProvider.mutate({
      clientId,
      type: type as CustomDomainLoginProviders,
      config: config as CustomDomainLoginProviderConfigSchema,
    })
  }
)
