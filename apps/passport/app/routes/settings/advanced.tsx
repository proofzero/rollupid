import { useState } from 'react'

import { Form, NavLink, useFetcher, useOutletContext } from '@remix-run/react'

import { Text } from '@proofzero/design-system'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import warningImg from '~/assets/warning.svg'
import InputText from '~/components/inputs/InputText'

import { getCoreClient } from '~/platform.server'
import {
  getValidatedSessionContext,
  destroyUserSession,
} from '~/session.server'

import { FLASH_MESSAGE } from '~/utils/flashMessage.server'

import type { ActionFunction } from '@remix-run/cloudflare'
import type { AccountURN } from '@proofzero/urns/account'
import { RollupError, ERROR_CODES, BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { HiOutlineX } from 'react-icons/hi'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { jwt, identityURN } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    try {
      const coreClient = getCoreClient({ context, jwt })
      const [accounts, apps, ownedApps] = await Promise.all([
        coreClient.identity.getAccounts.query({
          URN: identityURN,
        }),
        coreClient.identity.getAuthorizedApps.query({
          identity: identityURN,
        }),
        coreClient.starbase.listApps.query(),
      ])

      if (ownedApps.length > 0) {
        throw new BadRequestError({
          message:
            'Unable to delete Rollup identity as identity is an owner of applications',
        })
      }

      const accountURNs = accounts?.map(
        (account) => account.baseUrn
      ) as AccountURN[]

      await Promise.all([
        Promise.all(
          apps.map((app) => {
            return coreClient.authorization.revokeAppAuthorization.mutate({
              clientId: app.clientId,
              issuer: new URL(request.url).origin,
            })
          })
        ),
        Promise.all(
          accountURNs.map((accountURN) => {
            const coreClient = getCoreClient({ context, accountURN })
            return coreClient.account.deleteAccountNode.mutate({
              identityURN: identityURN,
              forceDelete: true,
            })
          })
        ),
        coreClient.identity.purgeIdentityGroupMemberships.mutate(),
      ])

      await coreClient.identity.deleteIdentityNode.mutate({
        identity: identityURN,
      })

      context.waitUntil(
        createAnalyticsEvent({
          apiKey: context.env.POSTHOG_API_KEY,
          eventName: 'identity_deleted_identity',
          distinctId: identityURN,
        })
      )
    } catch (ex) {
      console.error(ex)
      throw new RollupError({
        message: 'Unable to delete Rollup Identity',
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        cause: ex,
      })
    }

    return await destroyUserSession(
      request,
      '/',
      context.env,
      FLASH_MESSAGE.DELETE
    )
  }
)

const DeleteRollupIdentityModal = ({
  isOpen,
  setIsOpen,
  CONSOLE_URL,
  hasOwnedApps,
}: {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  CONSOLE_URL: string
  hasOwnedApps: boolean
}) => {
  const [confirmationString, setConfirmationString] = useState('')

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[260px] sm:min-w-[400px] md:max-w-[512px] lg:max-w-[512px]
     relative bg-white p-4 text-left
    transition-all sm:p-6 rounded-lg overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center justify-start">
          <img
            src={warningImg}
            className="object-cover w-10 h-10 rounded"
            alt="Not found"
          />

          <div className="flex flex-col space-y-2">
            <div className="flex flex-row w-full items-center justify-between">
              <Text weight="medium" size="lg" className="text-gray-900">
                Delete Rollup Identity
              </Text>
              <button
                className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
                onClick={() => {
                  setIsOpen(false)
                }}
              >
                <HiOutlineX />
              </button>
            </div>
            <Text size="xs" weight="normal">
              {hasOwnedApps
                ? 'Identity cannot be deleted as it has applications associated to it.\
                 Proceed to the Developer Console and delete the applications before\
                  retrying the deletion of identity.'
                : 'Are you sure you want to delete your Rollup Identity?\
                 This action will disconnect all your connected accounts and permanently\
                  delete your Rollup Identity.'}
            </Text>
          </div>
        </div>
        {hasOwnedApps ? null : (
          <div className="flex flex-col my-7 space-y-2">
            <InputText
              onChange={(text: string) => {
                setConfirmationString(text)
              }}
              heading="Type DELETE to confirm*"
            />
          </div>
        )}

        <div className="flex justify-end items-center space-x-3">
          {hasOwnedApps ? (
            <NavLink to={CONSOLE_URL} target="_blank">
              <Button
                btnType="secondary-alt"
                onClick={() => setIsOpen(false)}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Developer Console
              </Button>
            </NavLink>
          ) : (
            <Button
              btnType="secondary-alt"
              onClick={() => setIsOpen(false)}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
          )}

          {hasOwnedApps ? null : (
            <Form method="post">
              <Button
                type="submit"
                btnType="dangerous-alt"
                disabled={confirmationString !== 'DELETE'}
              >
                Delete Rollup Identity
              </Button>
            </Form>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function AdvancedLayout() {
  const [isOpen, setIsOpen] = useState(false)

  const { CONSOLE_URL } = useOutletContext<{
    CONSOLE_URL: string
  }>()
  const fetcher = useFetcher()

  const onDelete = () => {
    fetcher.load('/settings/advanced/owned-apps')
  }

  return (
    <>
      <Text weight="semibold" size="2xl" className="pb-6">
        Advanced Settings
      </Text>
      <DeleteRollupIdentityModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        CONSOLE_URL={CONSOLE_URL}
        hasOwnedApps={fetcher.data?.ownedApps?.length > 0}
      />
      <article
        className="flex-1 flex flex-col sm:flex-row
      px-5 py-4 space-x-4 rounded-lg border items-end
      sm:items-center bg-white shadow-sm"
      >
        <div className="flex-1 flex flex-col space-y-2">
          <Text weight="semibold" className="text-gray-900">
            Delete Rollup Identity
          </Text>

          <Text size="xs" weight="normal" className="text-gray-500">
            This action will disconnect all your connected accounts and
            permanently delete your Rollup Identity.
          </Text>
        </div>

        <div className="text-right max-sm:pt-4">
          <Button
            btnType="dangerous-alt"
            className="bg-white"
            onClick={() => {
              onDelete()
              setIsOpen(true)
            }}
          >
            Delete Rollup Identity
          </Button>
        </div>
      </article>
    </>
  )
}
