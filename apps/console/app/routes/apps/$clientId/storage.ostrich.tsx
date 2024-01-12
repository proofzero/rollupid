import {
  Form,
  useFetcher,
  useOutletContext,
  useTransition,
} from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { requireJWT } from '~/utilities/session.server'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import classNames from 'classnames'
import { appDetailsProps } from '~/types'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { useState } from 'react'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import dangerVector from '~/images/danger.svg'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import AppDataStorageModal from '~/components/AppDataStorageModal/AppDataStorageModal'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { clientId } = params
    if (!clientId) {
      throw new InternalServerError({
        message: 'Client id not found',
      })
    }

    const fd = await request.formData()
    switch (fd.get('op')) {
      case 'enable':
        const packageType = fd.get('package') as ExternalAppDataPackageType
        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
          packageType,
        })
        break
      case 'disable':
        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
        })
        break
      default:
        throw new BadRequestError({
          message: 'Invalid operation',
        })
    }

    return null
  }
)

export const ConfirmCancelModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}) => {
  const [confirmationText, setConfirmationText] = useState('')
  const transition = useTransition()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4 max-w-[512px]`}
      >
        <img src={dangerVector} alt="danger" />

        <div className="flex-1">
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Cancel Service
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

          <Form
            method="post"
            onSubmit={() => {
              setConfirmationText('')
              setIsOpen(false)
            }}
          >
            <input type="hidden" name="op" value="disable" />
            <section className="mb-4">
              <Text size="sm" weight="normal" className="text-gray-500 my-3">
                Are you sure you want to stop{' '}
                <Text type="span" weight="semibold" size="sm">
                  App Data Storage?
                </Text>
                <br /> This action will permanently delete all data from the
                service and any paid package used by the service will not be
                renewed in next billing cycle.
              </Text>

              <Text size="sm" weight="normal" className="text-gray-500 my-3">
                * Type CANCEL to confirm
              </Text>

              <Input
                id="confirm_text"
                placeholder="CANCEL"
                value={confirmationText}
                required
                className="mb-12"
                onChange={(e) => {
                  setConfirmationText(e.target.value)
                }}
              />
            </section>

            <div className="flex justify-end items-center space-x-3">
              <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  confirmationText !== 'CANCEL' || transition.state !== 'idle'
                }
                type="submit"
                btnType="dangerous"
              >
                Delete
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

export default () => {
  const { appDetails } = useOutletContext<{
    appDetails: appDetailsProps
  }>()

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

  const fetcher = useFetcher()

  return (
    <>
      {isCancelModalOpen && (
        <ConfirmCancelModal
          isOpen={isCancelModalOpen}
          setIsOpen={setIsCancelModalOpen}
        />
      )}
      {isSubscriptionModalOpen && (
        <AppDataStorageModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscriptionFetcher={fetcher}
          clientID={appDetails.clientId!}
        />
      )}

      <section className="flex flex-col space-y-5">
        <div className="flex flex-row items-center space-x-3">
          <Text size="2xl" weight="semibold" className="text-gray-900">
            Storage
          </Text>
          <DocumentationBadge
            url={'https://docs.rollup.id/platform/console/storage'}
          />
        </div>

        {appDetails.externalAppDataPackageDefinition?.status ===
          ExternalAppDataPackageStatus.Deleting && (
          <section className="my-4 p-4 flex flex-row items-center gap-3 bg-orange-50">
            <Spinner color="#F97316" size={20} margin="unset" weight="slim" />
            <Text size="sm" weight="medium" className="text-orange-600">
              Service cancellation in progress. Existing application data being
              deleted...{' '}
            </Text>
          </section>
        )}

        <section className="flex-1 bg-white border rounded-lg px-4 pt-3 pb-6">
          <section className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <Text size="lg" weight="semibold">
                App Data Storage
              </Text>

              {appDetails.externalAppDataPackageDefinition?.status ===
              ExternalAppDataPackageStatus.Deleting ? (
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              ) : (
                <div
                  className={classNames('w-2 h-2 rounded-full', {
                    'bg-green-500': Boolean(
                      appDetails.externalAppDataPackageDefinition
                    ),
                    'bg-gray-300': !Boolean(
                      appDetails.externalAppDataPackageDefinition
                    ),
                  })}
                ></div>
              )}
            </div>

            {appDetails.externalAppDataPackageDefinition?.status !==
              ExternalAppDataPackageStatus.Deleting && (
              <>
                {!Boolean(appDetails.externalAppDataPackageDefinition) && (
                  <Button
                    btnType="primary-alt"
                    className="flex flex-row items-center gap-3"
                    type="submit"
                    onClick={() => {
                      setIsSubscriptionModalOpen(true)
                    }}
                  >
                    <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                    <Text>Purchase Package</Text>
                  </Button>
                )}
                {Boolean(appDetails.externalAppDataPackageDefinition) && (
                  <Button
                    btnType="dangerous-alt"
                    className="flex flex-row items-center gap-3"
                    type="submit"
                    onClick={() => {
                      setIsCancelModalOpen(true)
                    }}
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    <Text>Cancel Service</Text>
                  </Button>
                )}
              </>
            )}
          </section>

          <section className="mt-2">
            <Text size="sm" className="text-gray-600">
              App Data Storage service provides a hassle-free way to store and
              retrieve per-user data for your application. <br /> Once
              activated, the service can be accessed through our Galaxy API and
              it supports storing data up to 128kb, per user.
            </Text>
          </section>
          <section className="mt-4">
            <div className="w-full h-px bg-gray-200"></div>
            <div className="flex flex-row justify-between items-center py-2">
              <Text size="sm" className="text-gray-800">
                Current Package:
              </Text>
              <Text size="sm" className="text-gray-500">
                {appDetails.externalAppDataPackageDefinition?.packageDetails
                  .title ?? 'No active package'}
              </Text>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="flex flex-row justify-between items-center py-2">
              <Text size="sm" className="text-gray-800">
                Reads:
              </Text>
              {Boolean(appDetails.externalAppDataPackageDefinition) ? (
                <Text size="sm" className="text-gray-500">
                  {
                    appDetails.externalAppDataPackageDefinition?.packageDetails
                      .reads
                  }{' '}
                  / month
                </Text>
              ) : (
                <Text size="sm" className="text-gray-500">
                  -
                </Text>
              )}
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="flex flex-row justify-between items-center pt-2">
              <Text size="sm" className="text-gray-800">
                Writes:
              </Text>
              {Boolean(appDetails.externalAppDataPackageDefinition) ? (
                <Text size="sm" className="text-gray-500">
                  {
                    appDetails.externalAppDataPackageDefinition?.packageDetails
                      .writes
                  }{' '}
                  / month
                </Text>
              ) : (
                <Text size="sm" className="text-gray-500">
                  -
                </Text>
              )}
            </div>
          </section>
        </section>
      </section>
    </>
  )
}
