import { useState } from 'react'

import { Form, useOutletContext } from '@remix-run/react'

import { Text } from '@proofzero/design-system'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import warningImg from '~/assets/warning.svg'
import InputText from '~/components/inputs/InputText'

import {
  getAccountClient,
  getAccessClient,
  getAddressClient,
} from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'

import type { ActionFunction } from '@remix-run/cloudflare'
import type { AddressURN } from '@proofzero/urns/address'

export const action: ActionFunction = async ({ request, context }) => {
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )
  const formData = await request.formData()
  const clientIds = JSON.parse(
    formData.get('appClientIds') as string
  ) as string[]

  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const accessClient = getAccessClient(context.env, context.traceSpan, jwt)

  const addresses = await accountClient.getAddresses.query({
    account: accountUrn,
  })

  const addressURNs = addresses?.map(
    (address) => address.baseUrn
  ) as AddressURN[]

  await Promise.all([
    Promise.all(
      addressURNs.map((addressURN) => {
        const addressClient = getAddressClient(
          addressURN,
          context.env,
          context.traceSpan,
          jwt
        )
        return addressClient.deleteAddressNodeMethod.mutate(accountUrn)
      })
    ),
    accountClient.deleteAccountNode.mutate({ account: accountUrn }),
    Promise.all(
      clientIds.map((clientId) => {
        return accessClient.revokeAppAuthorization.mutate({ clientId })
      })
    ),
  ])
}

const DeleteRollupIdentityModal = ({
  isOpen,
  setIsOpen,
  appClientIds,
}: {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  appClientIds: string[]
}) => {
  const [confirmationString, setConfirmationString] = useState('')

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[260px] sm:min-w-[400px] md:max-w-[512px] lg:max-w-[512px]
     relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left
    shadow-xl transition-all sm:p-6 overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center justify-start">
          <img
            src={warningImg}
            className="object-cover w-10 h-10 rounded"
            alt="Not found"
          />

          <div className="flex flex-col space-y-2">
            <Text weight="medium" size="lg" className="text-gray-900">
              Delete Rollup Identity
            </Text>
            <Text size="xs" weight="normal">
              Are you sure you want to delete your Rollup Identity? This action
              will disconnect all your connected accounts and permanently delete
              your Rollup Identity.
            </Text>
          </div>
        </div>
        <div className="flex flex-col my-7 space-y-2">
          <InputText
            onChange={(text: string) => {
              setConfirmationString(text)
            }}
            heading="Type DELETE to confirm*"
          />
        </div>

        <div className="flex justify-end items-center space-x-3">
          <Button
            btnType="secondary-alt"
            onClick={() => setIsOpen(false)}
            className="bg-gray-100"
          >
            Cancel
          </Button>

          <Form method="post">
            <input
              type="hidden"
              name="appClientIds"
              value={JSON.stringify(appClientIds)}
            />
            <Button
              type="submit"
              btnType="dangerous-alt"
              disabled={confirmationString !== 'DELETE'}
            >
              Delete Rollup Identity
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

export default function AdvancedLayout() {
  const { authorizedApps } = useOutletContext<{
    authorizedApps: {
      clientId: string
      icon: string
      title: string
      timestamp: number
    }[]
  }>()
  const appClientIds = authorizedApps?.map((app) => app.clientId) || []
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Text weight="semibold" size="2xl" className="pb-6">
        Advanced Settings
      </Text>
      <DeleteRollupIdentityModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        appClientIds={appClientIds}
      />
      <article
        className="flex-1 flex flex-col sm:flex-row
      px-5 py-4 space-x-4 rounded-lg border items-end
      sm:items-center bg-white"
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
