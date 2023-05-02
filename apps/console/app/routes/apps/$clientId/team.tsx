import { Button, Text } from '@proofzero/design-system'
import { HiOutlineMail } from 'react-icons/hi'
import { useLoaderData, useOutletContext, useSubmit } from '@remix-run/react'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { redirect } from '@remix-run/cloudflare'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { requireJWT } from '~/utilities/session.server'
import { checkToken } from '@proofzero/utils/token'

import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createStarbaseClient from '@proofzero/platform-clients/starbase'

import { EmailSelect } from '@proofzero/design-system/src/atoms/email/EmailSelect'
import {
  getNormalisedConnectedEmails,
  OptionType,
} from '@proofzero/utils/getNormalisedConnectedAccounts'

import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedAccounts'

import type { AddressURN } from '@proofzero/urns/address'
import type { AccountURN } from '@proofzero/urns/account'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const clientId = params.clientId as string

  const jwt = await requireJWT(request)
  const payload = checkToken(jwt)
  const accountURN = payload.sub as AccountURN

  const accountClient = createAccountClient(Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })
  const connectedEmails = getNormalisedConnectedEmails(connectedAccounts)

  // If we are coming back from a successful connect flow
  // and we have only one email address, and no appContactAddress set
  // We can infer the intention of the user and automatically
  // set their e-mail to the one just connected
  // All other cases are ambiguous and we should not make assumptions
  const requestURL = new URL(request.url)
  const connectResult = requestURL.searchParams.get('rollup_result')
  if (connectResult && connectResult === 'SUCCESS') {
    if (connectedEmails.length === 1) {
      const starbaseClient = createStarbaseClient(Starbase, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(context.traceSpan),
      })

      const appContactAddress = await starbaseClient.getAppContactAddress.query(
        {
          clientId,
        }
      )

      if (!appContactAddress) {
        await starbaseClient.upsertAppContactAddress.mutate({
          address: connectedEmails[0].addressURN!,
          clientId,
        })

        return redirect(requestURL.toString())
      }
    }
  }

  return {
    connectedEmails,
  }
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const clientId = params.clientId as string
  const jwt = await requireJWT(request)

  const fd = await request.formData()
  const addressURN = fd.get('addressURN') as AddressURN
  if (!addressURN) {
    throw new Error('No addressURN')
  }

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  await starbaseClient.upsertAppContactAddress.mutate({
    address: addressURN,
    clientId,
  })

  // Remix preserves route from before
  // history erasure so searchParams
  // are regenerated; manual removal
  const requestURL = new URL(request.url)
  const connectResult = requestURL.searchParams.get('rollup_result')
  if (connectResult) {
    requestURL.searchParams.delete('rollup_result')
    return redirect(requestURL.toString())
  }

  return null
}

export default () => {
  useConnectResult(['SUCCESS', 'ALREADY_CONNECTED', 'CANCEL'])

  const submit = useSubmit()

  const { connectedEmails } = useLoaderData<{
    connectedEmails: EmailSelectListItem[]
  }>()

  const { PASSPORT_URL, appContactAddress } = useOutletContext<{
    PASSPORT_URL: string
    appContactAddress?: AddressURN
  }>()

  const redirectToPassport = () => {
    const currentURL = new URL(window.location.href)
    currentURL.search = ''

    const qp = new URLSearchParams()
    qp.append('scope', '')
    qp.append('state', 'skip')
    qp.append('client_id', 'console')

    qp.append('redirect_uri', currentURL.toString())
    qp.append('rollup_action', 'connect')
    qp.append('login_hint', 'email microsoft google apple')

    window.location.href = `${PASSPORT_URL}/authorize?${qp.toString()}`
  }

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

        <div className="self-start mb-8 w-80">
          {connectedEmails && connectedEmails.length === 0 && (
            <Button onClick={redirectToPassport} btnType="secondary-alt">
              <div className="flex space-x-3">
                <HiOutlineMail className="w-6 h-6 text-gray-800" />
                <Text weight="medium" className="flex-1 text-gray-800">
                  Connect Email Address
                </Text>
              </div>
            </Button>
          )}

          {connectedEmails && connectedEmails.length > 0 && (
            <>
              <Text size="sm" weight="medium" className="text-gray-700 mb-0.5">
                <sup>*</sup>
                Email
              </Text>

              <EmailSelect
                items={connectedEmails}
                enableAddNew={true}
                defaultAddress={appContactAddress}
                onSelect={(selected: EmailSelectListItem) => {
                  if (selected?.type === OptionType.AddNew) {
                    return redirectToPassport()
                  }

                  if (selected.addressURN === appContactAddress) {
                    return
                  }

                  if (!selected.addressURN) {
                    console.error('No addressURN')
                    return
                  }

                  submit(
                    {
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
