import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { redirect, json } from '@remix-run/cloudflare'

import { getAuthzCookieParams } from '~/session.server'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import Authentication, {
  AuthenticationScreenDefaults,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Avatar } from '@proofzero/packages/design-system/src/atoms/profile/avatar/Avatar'
import { Button } from '@proofzero/packages/design-system/src/atoms/buttons/Button'
import {
  getErrorCause,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'
import { BadRequestError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  obfuscateAlias,
} from '@proofzero/utils'
import _ from 'lodash'

const LazyAuth = lazy(() =>
  import('../../../web3/lazyAuth').then((module) => ({
    default: module.LazyAuth,
  }))
)

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (
      request.cf.botManagement.score <= 30 &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
    ) {
      return null
    }
    const url = new URL(request.url)

    let displayKeys = AuthenticationScreenDefaults.knownKeys

    let loginHint = url.searchParams.get('login_hint')

    if (loginHint) {
      const hints = loginHint
        .split(' ')
        .filter((val, i, arr) => arr.indexOf(val) === i)

      displayKeys = hints
    }

    const authzParams = await getAuthzCookieParams(
      request,
      context.env,
      params.clientId
    )

    let invitationData
    if (authzParams.rollup_action?.startsWith('groupconnect')) {
      const groupID = authzParams.rollup_action.split('_')[1]
      const invitationCode = authzParams.rollup_action.split('_')[2]

      const identityGroupURN = IdentityGroupURNSpace.urn(
        groupID
      ) as IdentityGroupURN

      const traceHeader = generateTraceContextHeaders(context.traceSpan)
      const coreClient = createCoreClient(context.env.Core, {
        ...getAuthzHeaderConditionallyFromToken(undefined),
        ...traceHeader,
      })

      const invDetails =
        await coreClient.identity.getIdentityGroupMemberInvitationDetails.query(
          {
            invitationCode,
            identityGroupURN,
          }
        )

      invitationData = {
        groupName: invDetails.identityGroupName,
        identifier: obfuscateAlias(
          invDetails.identifier,
          invDetails.accountType
        ),
        accountType: invDetails.accountType,
        inviterAlias: invDetails.inviter,
      }
    }

    return json({
      clientId: params.clientId,
      displayKeys,
      authnQueryParams: new URL(request.url).searchParams.toString(),
      invitationData,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const authzCookieParams = await getAuthzCookieParams(
      request,
      context.env,
      params.clientId
    )

    const { redirectUri, state, scope, clientId, prompt } = authzCookieParams

    const qp = new URLSearchParams()
    qp.append('client_id', clientId)
    qp.append('redirect_uri', redirectUri)
    qp.append('state', state)
    qp.append('scope', scope.join(' '))
    if (prompt) qp.append('prompt', prompt)

    return redirect(`/authorize?${qp.toString()}`)
  }
)

const InnerComponent = ({
  transitionState,
  appProps,
  rollup_action,
  displayKeys,
  clientId,
  authnQueryParams,
  invitationData,
}: {
  transitionState: string
  appProps?: GetAppPublicPropsResult
  rollup_action?: string
  displayKeys?: any
  clientId: string
  authnQueryParams: string
  invitationData?: {
    inviterAlias: string
    groupName: string
    identifier: string
    accountType: string
  }
}) => {
  const [signData, setSignData] = useState<{
    nonce: string | undefined
    state: string | undefined
    address: string | undefined
    signature: string | undefined
  }>({
    nonce: undefined,
    state: undefined,
    address: undefined,
    signature: undefined,
  })
  const [loading, setLoading] = useState(false)

  const iconURL = appProps?.iconURL

  const submit = useSubmit()

  const navigate = useNavigate()

  useEffect(() => {
    const url = new URL(window.location.href)

    const error = url.searchParams.get('oauth_error')
    if (error) {
      const message = getOAuthErrorMessage(error)
      toast(ToastType.Error, { message }, { duration: 2000 })
      url.searchParams.delete('oauth_error')
    }

    history.replaceState(null, '', url.toString())
  }, [])

  const generic = Boolean(rollup_action) && !rollup_action?.startsWith('group_')

  return (
    <Authentication
      logoURL={iconURL}
      Header={
        <>
          {generic && (
            <>
              <Text
                size="xl"
                weight="semibold"
                className="text-[#2D333A] dark:text-white mt-6 mb-8"
              >
                Connect Account
              </Text>

              {invitationData && rollup_action?.startsWith('groupconnect_') && (
                <Text className="text-gray-600 mb-8">
                  To continue please connect your <br />
                  <Text
                    type="span"
                    weight="bold"
                    className="text-orange-600"
                  >{`${_.upperFirst(invitationData.accountType)} Account: ${
                    invitationData.identifier
                  }`}</Text>
                </Text>
              )}
            </>
          )}

          {!generic && (
            <>
              <Avatar
                src={iconURL ?? AuthenticationScreenDefaults.defaultLogoURL}
                size="sm"
              ></Avatar>

              {!rollup_action?.startsWith('groupconnect') && (
                <div className={'flex flex-col items-center gap-2'}>
                  <h1
                    className={
                      'font-semibold text-xl dark:text-white text-center'
                    }
                  >
                    {appProps?.appTheme?.heading
                      ? appProps.appTheme.heading
                      : appProps?.name
                      ? `Login to ${appProps?.name}`
                      : AuthenticationScreenDefaults.defaultHeading}
                  </h1>
                  <h2
                    style={{ color: '#6B7280' }}
                    className={'font-medium text-base'}
                  >
                    {AuthenticationScreenDefaults.defaultSubheading}
                  </h2>
                </div>
              )}
            </>
          )}

          {invitationData && rollup_action?.startsWith('group_') && (
            <>
              <Text className="text-center truncate max-w-xs">
                <Text type="span" className="truncate" weight="bold">
                  "{invitationData.inviterAlias}"
                </Text>
                <br />
                has invited you to join group
                <br />
                <Text type="span" className="truncate" weight="bold">
                  "{invitationData.groupName}""
                </Text>
              </Text>
              <Text className="truncate max-w-xs">
                To accept please authenticate with your <br />
                <Text
                  type="span"
                  weight="bold"
                  className="text-orange-600 truncate"
                >{`${_.upperFirst(invitationData.accountType)} Account: ${
                  invitationData.identifier
                }`}</Text>
              </Text>
            </>
          )}
        </>
      }
      Actions={
        generic ? (
          <>
            <div className="flex flex-1 items-end">
              <Button
                btnSize="l"
                btnType="secondary-alt-skin"
                className="w-full"
                onClick={() => navigate('/authenticate/cancel')}
              >
                <Text className="dark:text-white">Cancel</Text>
              </Button>
            </div>
          </>
        ) : undefined
      }
      displayKeys={
        appProps?.appTheme?.providers
          ?.filter((p) => p.enabled)
          ?.filter((p) => displayKeys.includes(p.key))
          .map((p) => p.key) ?? displayKeys
      }
      mapperArgs={{
        signMessageTemplate:
          appProps?.appTheme?.signMessageTemplate ??
          AuthenticationScreenDefaults.defaultSignMessage,
        clientId,
        signData,
        navigate,
        authnQueryParams,
        loading: loading || transitionState !== 'idle',
        walletConnectCallback: async (address) => {
          if (loading) return
          // fetch nonce and kickoff sign flow
          setLoading(true)
          try {
            if (window.navigator.onLine != true) {
              throw new BadRequestError({
                message:
                  'You seem to be offline. Please connect to the internet and try again.',
              })
            }

            const res = await fetch(`/connect/${address}/sign`, {
              method: 'GET',
            }) // NOTE: note using fetch because it messes with wagmi state

            const resJson = await res.json<{
              nonce: string
              state: string
              address: string
            }>()

            if (!res.ok) {
              throw getErrorCause(resJson)
            }

            setSignData({
              nonce: resJson.nonce,
              state: resJson.state,
              address: resJson.address,
              signature: undefined,
            })
          } catch (ex) {
            toast(ToastType.Error, {
              message:
                ex.message ??
                'Could not complete authentication. Please return to application and try again.',
            })
          }
          setLoading(false)
        },
        walletSignCallback: (address, signature, nonce, state) => {
          console.debug('signing complete')
          setSignData({
            ...signData,
            signature,
          })
          try {
            if (window.navigator.onLine != true) {
              throw new BadRequestError({
                message:
                  'You seem to be offline. Please connect to the internet and try again.',
              })
            }

            submit(
              { signature, nonce, state },
              {
                method: 'post',
                action: `/connect/${address}/sign`,
              }
            )
          } catch (ex) {
            toast(ToastType.Error, {
              message:
                ex.message ??
                'Could not complete authentication. Please return to application and try again.',
            })
          }
        },
        walletConnectErrorCallback: (error) => {
          console.debug('transition.state: ', transitionState)
          if (transitionState !== 'idle' || !loading) {
            return
          }
          if (error) {
            console.error(error)
            toast(ToastType.Error, {
              message:
                'Failed to complete signing. Please try again or contact support.',
            })
            setLoading(false)
          }
        },
      }}
    />
  )
}

const getOAuthErrorMessage = (error: string): string => {
  switch (error) {
    case 'invalid_request':
    case 'invalid_client':
    case 'invalid_grant':
    case 'unauthorized_client':
    case 'unsupported_response_type':
    case 'invalid_scope':
    case 'server_error':
      return 'An error was encountered with the provider configuration.'
    case 'access_denied':
    case 'temporarily_unavailable':
      return 'Something went wrong with the provider authorization. Please try again.'
    default:
      return 'An unknown error occurred'
  }
}

export default () => {
  const { appProps, rollup_action } = useOutletContext<{
    appProps: GetAppPublicPropsResult
    rollup_action?: string
  }>()

  const { clientId, displayKeys, authnQueryParams, invitationData } =
    useLoaderData() ?? {}

  const transition = useTransition()

  return (
    <>
      <Suspense fallback="">
        <LazyAuth autoConnect={true}>
          <InnerComponent
            transitionState={transition.state}
            appProps={appProps!}
            rollup_action={rollup_action!}
            displayKeys={displayKeys}
            clientId={clientId}
            authnQueryParams={authnQueryParams}
            invitationData={invitationData}
          />
        </LazyAuth>
      </Suspense>
    </>
  )
}
