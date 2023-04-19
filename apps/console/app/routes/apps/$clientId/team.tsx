import { Text } from '@proofzero/design-system'
import { HiOutlineMail } from 'react-icons/hi'
import { AuthButton } from '@proofzero/design-system/src/molecules/auth-button/AuthButton'
import { useLoaderData, useSubmit } from '@remix-run/react'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/cloudflare'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { requireJWT } from '~/utilities/session.server'
import { checkToken } from '@proofzero/utils/token'

import createAccountClient from '@proofzero/platform-clients/account'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

import getNormalisedConnectedEmails, {
  EmailSelectListItem,
  OptionType,
} from '@proofzero/utils/getNormalisedConnectedEmails'

import { EmailSelect } from '@proofzero/design-system/src/atoms/email/EmailSelect'
import { AddressURN } from '@proofzero/urns/address'
import createStarbaseClient from '@proofzero/platform-clients/starbase'

export function getAccountClient(jwt: string, env: any, traceSpan: TraceSpan) {
  return createAccountClient(env.Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
}

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const jwt = await requireJWT(request)
  const payload = checkToken(jwt)
  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  if (
    !AccountURNSpace.is(payload.sub!) ||
    !(await accountClient.isValid.query())
  )
    throw new Error('Foo')

  const accountURN = payload.sub as AccountURN

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })

  if (!connectedAccounts || !connectedAccounts.length) {
    throw new Error('Bar')
  }

  const connectedEmails = getNormalisedConnectedEmails(connectedAccounts)

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const appContactEmail = await starbaseClient.getAppContactEmail.query({
    clientId: params.clientId as string,
  })

  return {
    connectedEmails,
    appContactEmail,
  }
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const clientId = params.clientId as string
  const jwt = await requireJWT(request)

  // get type from formData
  const fd = await request.formData()
  const type = fd.get('type')

  switch (type) {
    case 'set':
      const addressURN = fd.get('addressURN') as AddressURN
      if (!addressURN) {
        throw new Error('No addressURN')
      }

      const starbaseClient = createStarbaseClient(Starbase, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(context.traceSpan),
      })

      await starbaseClient.upsertAppContactEmail.mutate({
        address: addressURN,
        clientId,
      })

      break
    case 'redirect':
    default:
      const currentURL = new URL(request.url)
      currentURL.search = ''

      const qp = new URLSearchParams()
      qp.append('scope', '')
      qp.append('state', 'skip')
      qp.append('client_id', 'console')

      qp.append('redirect_uri', currentURL.toString())
      qp.append('prompt', 'connect')
      qp.append('login_hint', 'email microsoft google apple')

      return redirect(`${PASSPORT_URL}/authorize?${qp.toString()}`)
  }

  return null
}

export default () => {
  useConnectResult(['SUCCESS', 'ALREADY_CONNECTED', 'CANCEL'])

  const submit = useSubmit()

  const { connectedEmails, appContactEmail } = useLoaderData<{
    connectedEmails: EmailSelectListItem[]
    appContactEmail: AddressURN | undefined
  }>()

  return (
    <>
      <div className="flex flex-row items-center space-x-3 pb-5">
        <Text
          size="2xl"
          weight="semibold"
          className="text-gray-900 ml-2 lg:ml-0 "
        >
          Team & Contact
        </Text>

        <DocumentationBadge url="https://docs.rollup.id/platform/console/teams-and-contact" />
      </div>

      <div className="bg-white p-10 rounded-lg shadow flex flex-col">
        <Text size="lg" weight="semibold" className="text-gray-900 mb-4">
          Contact Email
        </Text>

        <div className="self-start mb-8 w-[262px]">
          {connectedEmails && !connectedEmails.length && (
            <AuthButton
              onClick={() =>
                submit(
                  {
                    type: 'redirect',
                  },
                  { method: 'post' }
                )
              }
              Graphic={<HiOutlineMail className="w-full h-full" />}
              text={'Connect Email Address'}
            />
          )}

          {connectedEmails && connectedEmails.length && (
            <>
              <Text size="sm" weight="medium" className="text-gray-700 mb-0.5">
                <sup>*</sup>
                Email
              </Text>

              <EmailSelect
                items={connectedEmails}
                enableAddNew={true}
                defaultAddress={appContactEmail}
                onSelect={(selected: EmailSelectListItem) => {
                  if (selected?.type === OptionType.AddNew) {
                    return submit(
                      {
                        type: 'redirect',
                      },
                      { method: 'post' }
                    )
                  }

                  if (!selected.addressURN) {
                    console.error('No addressURN')
                    return
                  }

                  submit(
                    {
                      type: 'set',
                      addressURN: selected.addressURN,
                    },
                    {
                      method: 'post',
                    }
                  )
                }}
              />
            </>
          )}
        </div>

        <Text size="sm" weight="normal" className="text-gray-500">
          This will be used for notifications about your application
        </Text>
      </div>
    </>
  )
}
