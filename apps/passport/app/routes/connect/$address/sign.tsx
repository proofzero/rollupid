import { json, redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { getAddressClient } from '../../../platform.server'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { getAuthzCookieParams, getUserSession } from '../../../session.server'
import { getAuthzRedirectURL } from '../../../utils/authenticate.server'

import { parseJwt } from '@proofzero/packages/utils'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import type { AccountURN } from '@proofzero/urns/account'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'

import { getStarbaseClient } from '~/platform.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const { address } = params
    if (!address)
      throw new BadRequestError({ message: 'No address included in request' })

    const state = Math.random().toString(36).substring(7)
    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAddressType.ETH, address),
      { node_type: NodeType.Crypto, addr_type: CryptoAddressType.ETH },
      { alias: address }
    )

    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    let signTemplate = AuthenticationScreenDefaults.defaultSignMessage

    const { clientId } = await getAuthzCookieParams(request, context.env)
    if (clientId !== 'console' && clientId !== 'passport') {
      const sbClient = getStarbaseClient('', context.env, context.traceSpan)
      const appProps = await sbClient.getAppPublicProps.query({
        clientId,
      })
      if (appProps.appTheme?.signMessageTemplate) {
        signTemplate = appProps.appTheme.signMessageTemplate
      }
    }

    try {
      const nonce = await addressClient.getNonce.query({
        address: address as string,
        template: signTemplate,
        state,
        redirectUri: context.env.PASSPORT_REDIRECT_URL,
        scope: ['admin'],
      })
      return json({ nonce, address, state })
    } catch (e) {
      console.error('Error getting nonce', e)
      throw json(`Error getting nonce: ${e}`, { status: 500 })
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const appData = await getAuthzCookieParams(request, context.env)
    const jwt = await getUserSession(request, context.env, params.clientId)

    const { address } = params
    if (!address)
      throw new BadRequestError({ message: 'No address included in request' })

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAddressType.ETH, address),
      { node_type: NodeType.Crypto, addr_type: CryptoAddressType.ETH },
      { alias: address }
    )
    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )
    const formData = await request.formData()

    // TODO: validate from data
    const { existing } = await addressClient.verifyNonce.mutate({
      nonce: formData.get('nonce') as string,
      signature: formData.get('signature') as string,
      jwt: await getUserSession(request, context.env, appData?.clientId),
      forceAccountCreation: !appData || appData.rollup_action !== 'connect',
    })

    const accountURNFromAddress = await addressClient.getAccount.query()


    if (appData?.rollup_action === 'connect' && existing) {
      const accountURN = parseJwt(jwt).sub! as AccountURN
      if (accountURN === accountURNFromAddress) {
        return redirect(getAuthzRedirectURL(appData, 'ALREADY_CONNECTED_ERROR'))
      }
      return redirect(getAuthzRedirectURL(appData, 'ACCOUNT_CONNECT_ERROR'))
    }

    // TODO: handle the error case
    const searchParams = new URL(request.url).searchParams
    searchParams.set('node_type', 'crypto')
    searchParams.set('addr_type', 'eth')
    const state = formData.get('state')
    if (state) {
      searchParams.set('state', state as string)
    }

    return redirect(`/connect/${params.address}/token?${searchParams}`)
  }
)
