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

export function getAccountClient(jwt: string, env: any, traceSpan: TraceSpan) {
  return createAccountClient(env.Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
}

export const loader: LoaderFunction = async ({ request, context }) => {
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

  return {
    connectedEmails,
  }
}

export const action: ActionFunction = async ({ request }) => {
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

export default () => {
  useConnectResult(['SUCCESS', 'ALREADY_CONNECTED', 'CANCEL'])

  const submit = useSubmit()

  const { connectedEmails } = useLoaderData<{
    connectedEmails: EmailSelectListItem[]
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

        <div className="self-start mb-8">
          {connectedEmails && !connectedEmails.length && (
            <AuthButton
              onClick={() => submit({}, { method: 'post' })}
              Graphic={<HiOutlineMail className="w-full h-full" />}
              text={'Connect Email Address'}
            />
          )}

          {connectedEmails && connectedEmails.length && (
            <EmailSelect
              items={connectedEmails}
              enableAddNew={true}
              onSelect={(selected: EmailSelectListItem) => {
                if (selected?.type === OptionType.AddNew) {
                  return submit({}, { method: 'post' })
                }
              }}
            />
          )}
        </div>

        <Text size="sm" weight="normal" className="text-gray-500">
          This will be used for notifications about your application
        </Text>
      </div>
    </>
  )
}
