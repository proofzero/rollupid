import { json, redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { getCoreClient } from '../../../platform.server'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { CryptoAccountType, NodeType } from '@proofzero/types/account'
import { getAuthzCookieParams, getUserSession } from '../../../session.server'
import { getAuthzRedirectURL } from '../../../utils/authenticate.server'

import { parseJwt } from '@proofzero/packages/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  JsonError,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'
import type { IdentityURN } from '@proofzero/urns/identity'
import {
  AuthenticationScreenDefaults,
  appendNonceTemplate,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const { address } = params
    if (!address)
      throw new BadRequestError({ message: 'No address included in request' })

    const state = Math.random().toString(36).substring(7)
    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAccountType.ETH, address),
      { node_type: NodeType.Crypto, addr_type: CryptoAccountType.ETH },
      { alias: address }
    )

    const coreClient = getCoreClient({ context, accountURN })

    let signTemplate = AuthenticationScreenDefaults.defaultSignMessage

    let clientId: string = ''
    try {
      const res = await getAuthzCookieParams(request, context.env)
      clientId = res.clientId
    } catch (ex) {
      const traceparent = context.traceSpan.getTraceParent()
      return JsonError(ex, traceparent)
    }
    if (clientId !== 'console' && clientId !== 'passport') {
      const appProps = await coreClient.starbase.getAppPublicProps.query({
        clientId,
      })
      if (appProps.appTheme?.signMessageTemplate) {
        signTemplate = appProps.appTheme.signMessageTemplate
      }
    }

    try {
      const nonce = await coreClient.account.getNonce.query({
        address: address as string,
        template: appendNonceTemplate(signTemplate),
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

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAccountType.ETH, address),
      { node_type: NodeType.Crypto, addr_type: CryptoAccountType.ETH },
      { alias: address }
    )
    const coreClient = getCoreClient({ context, accountURN })
    const formData = await request.formData()

    // TODO: validate from data
    const { existing } = await coreClient.account.verifyNonce.mutate({
      nonce: formData.get('nonce') as string,
      signature: formData.get('signature') as string,
      jwt: await getUserSession(request, context.env, appData?.clientId),
      forceAccountCreation:
        !appData ||
        (appData.rollup_action !== 'connect' &&
          !appData.rollup_action?.startsWith('groupconnect')),
    })

    const identityURNFromAccount = await coreClient.account.getIdentity.query()

    if (
      (appData?.rollup_action === 'connect' ||
        appData?.rollup_action?.startsWith('groupconnect')) &&
      existing
    ) {
      const identityURN = parseJwt(jwt).sub! as IdentityURN
      if (identityURN === identityURNFromAccount) {
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
