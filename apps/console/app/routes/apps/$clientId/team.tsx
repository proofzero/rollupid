import { useEffect } from 'react'
import { Button, Text } from '@proofzero/design-system'
import { HiOutlineMail } from 'react-icons/hi'
import {
  useActionData,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { redirect } from '@remix-run/cloudflare'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { requireJWT } from '~/utilities/session.server'

import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import {
  getEmailIcon,
  getEmailDropdownItems,
} from '@proofzero/utils/getNormalisedConnectedAccounts'

import type { AccountURN } from '@proofzero/urns/account'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import type { errorsTeamProps, notificationHandlerType } from '~/types'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  Dropdown,
  DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { redirectToPassport } from '~/utils'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const clientId = params.clientId as string

    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const { ownerURN } = await coreClient.starbase.getAppDetails.query({
      clientId,
    })

    const connectedAccounts = await coreClient.identity.getAccounts.query({
      URN: ownerURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    // If we are coming back from a successful connect flow
    // and we have only one email address, and no appContactAddress set
    // We can infer the intention of the user and automatically
    // set their e-mail to the one just connected
    // All other cases are ambiguous and we should not make assumptions
    const requestURL = new URL(request.url)
    const connectResult = requestURL.searchParams.get('rollup_result')
    if (connectResult && connectResult === 'SUCCESS') {
      if (connectedEmails.length === 1) {
        const coreClient = createCoreClient(context.env.Core, {
          ...getAuthzHeaderConditionallyFromToken(jwt),
          ...generateTraceContextHeaders(context.traceSpan),
        })

        const appContactAddress =
          await coreClient.starbase.getAppContactAddress.query({
            clientId,
          })

        if (!appContactAddress) {
          await coreClient.starbase.upsertAppContactAddress.mutate({
            account: connectedEmails[0].value as AccountURN,
            clientId,
          })

          return redirect(requestURL.toString())
        }
      }
    }

    return {
      connectedEmails,
      groupID: IdentityGroupURNSpace.is(ownerURN)
        ? ownerURN.split('/')[1]
        : undefined,
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const clientId = params.clientId as string
    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const accountURN = fd.get('accountURN') as AccountURN
    if (!accountURN) {
      throw new BadRequestError({ message: 'No accountURN' })
    }

    const errors: errorsTeamProps = {}

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    try {
      await coreClient.starbase.upsertAppContactAddress.mutate({
        account: accountURN,
        clientId,
      })
    } catch (e) {
      errors.upserteAppContactAddress = "Failed to upsert app's contact address"
    }

    // Remix preserves route from before
    // history erasure so searchParams
    // are regenerated; manual removal
    const requestURL = new URL(request.url)
    const connectResult = requestURL.searchParams.get('rollup_result')
    if (connectResult) {
      requestURL.searchParams.delete('rollup_result')
      return redirect(requestURL.toString())
    }

    return { errors }
  }
)

export default () => {
  useConnectResult()

  const submit = useSubmit()

  let { connectedEmails, groupID } = useLoaderData() as {
    groupID?: string
    connectedEmails: Array<DropdownSelectListItem>
  }

  const { PASSPORT_URL, notificationHandler, appContactAddress } =
    useOutletContext<{
      PASSPORT_URL: string
      notificationHandler: notificationHandlerType
      appContactAddress?: AccountURN
    }>()

  const actionData = useActionData()

  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
    }
  }, [errors])

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
            <Button
              onClick={() =>
                redirectToPassport({
                  PASSPORT_URL,
                  login_hint: groupID
                    ? 'email'
                    : 'email microsoft google apple',
                  rollup_action: groupID
                    ? `groupemailconnect_${groupID}`
                    : 'connect',
                })
              }
              btnType="secondary-alt"
            >
              <div className="flex space-x-3">
                <HiOutlineMail className="w-6 h-6 text-gray-800" />
                <Text weight="medium" className="flex-1 text-gray-800">
                  Connect Email Account
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

              <Dropdown
                items={connectedEmails.map((email: DropdownSelectListItem) => {
                  email.value === appContactAddress
                    ? (email.selected = true)
                    : (email.selected = false)
                  // Substituting subtitle with icon
                  // on the client side
                  email.subtitle && !email.icon
                    ? (email.icon = getEmailIcon(email.subtitle))
                    : null
                  return {
                    value: email.value,
                    selected: email.selected,
                    icon: email.icon,
                    title: email.title,
                  }
                })}
                placeholder="Select an Email Account"
                onSelect={(selected) => {
                  // type casting to DropdownSelectListItem instead of array
                  if (!Array.isArray(selected)) {
                    if (!selected || !selected.value) {
                      console.error('Error selecting email, try again')
                      return
                    }
                    if (selected.value === appContactAddress) {
                      return
                    }
                    submit(
                      {
                        accountURN: selected.value,
                      },
                      {
                        method: 'post',
                      }
                    )
                  }
                }}
                ConnectButtonCallback={() =>
                  redirectToPassport({
                    PASSPORT_URL,
                    login_hint: groupID
                      ? 'email'
                      : 'email microsoft google apple',
                    rollup_action: groupID
                      ? `groupemailconnect_${groupID}`
                      : 'connect',
                  })
                }
                ConnectButtonPhrase="Connect New Email Address"
                defaultItems={connectedEmails
                  .filter((el) => el.value === appContactAddress)
                  .map((email: DropdownSelectListItem) => ({
                    value: email.value,
                    selected: email.selected,
                    icon: email.icon,
                    title: email.title,
                  }))}
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
