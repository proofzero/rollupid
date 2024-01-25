import {
  Form,
  useFetcher,
  useOutletContext,
  useTransition,
} from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { requireJWT } from '~/utilities/session.server'
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '@proofzero/errors'
import classNames from 'classnames'
import { appDetailsProps } from '~/types'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import {
  HiDotsVertical,
  HiOutlinePencilAlt,
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { Fragment, useEffect, useState } from 'react'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import dangerVector from '~/images/danger.svg'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import AppDataStorageModal from '~/components/AppDataStorageModal/AppDataStorageModal'
import { Menu, Transition } from '@headlessui/react'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { createOrUpdateSubscription } from '~/utils/billing'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { IdentityURN } from '@proofzero/urns/identity'
import {
  cancelSubscription,
  changePriceID,
  createInvoice,
} from '~/services/billing/stripe'
import Stripe from 'stripe'
import { packageTypeToPriceID } from '~/utils/external-app-data'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
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

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: clientId as string,
    })

    if (
      appDetails.externalAppDataPackageDefinition?.packageDetails.subscriptionID
    ) {
      const spd = await coreClient.billing.getStripePaymentData.query({
        URN: appDetails.ownerURN,
      })

      await createInvoice(
        new Stripe(context.env.SECRET_STRIPE_API_KEY, {
          apiVersion: '2022-11-15',
        }),
        spd.customerID,
        appDetails.externalAppDataPackageDefinition?.packageDetails
          .subscriptionID,
        appDetails.externalAppDataPackageDefinition.packageDetails
          .packageType === ExternalAppDataPackageType.STARTER
          ? context.env.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID
          : context.env.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID,
        true,
        {
          clientID: clientId,
        }
      )
    }

    return null
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const { env } = context

    const jwt = await requireJWT(request, env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { clientId } = params
    if (!clientId) {
      throw new InternalServerError({
        message: 'Client id not found',
      })
    }

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: clientId as string,
    })

    if (IdentityGroupURNSpace.is(appDetails.ownerURN)) {
      const { write } =
        await coreClient.identity.hasIdentityGroupPermissions.query({
          identityURN,
          identityGroupURN: appDetails.ownerURN as IdentityGroupURN,
        })

      if (!write) {
        throw new UnauthorizedError({
          message:
            'You are not authorized to update an app belonging to this identity group.',
        })
      }
    }

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: appDetails.ownerURN,
    })

    const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
      apiVersion: '2022-11-15',
    })

    const fd = await request.formData()
    switch (fd.get('op')) {
      case 'enable':
        const newPackageType = fd.get('package') as ExternalAppDataPackageType
        const autoTopUp = fd.get('top-up') !== '0'

        let sub
        if (appDetails.externalAppDataPackageDefinition?.packageDetails) {
          const { subscriptionID, packageType: oldPackageType } =
            appDetails.externalAppDataPackageDefinition.packageDetails

          sub = await changePriceID({
            subscriptionID,
            stripeClient,
            oldPriceID: packageTypeToPriceID(env, oldPackageType),
            newPriceID: packageTypeToPriceID(env, newPackageType),
          })
        } else {
          sub = await createOrUpdateSubscription({
            customerID: spd.customerID,
            URN: appDetails.ownerURN,
            planID: packageTypeToPriceID(env, newPackageType),
            SECRET_STRIPE_API_KEY: env.SECRET_STRIPE_API_KEY,
            quantity: 1,
          })
        }

        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
          externalAppDataPackage: {
            packageType: newPackageType,
            subscriptionID: sub.id,
          },
          autoTopUp,
        })
        break
      case 'disable':
        if (!appDetails.externalAppDataPackageDefinition?.packageDetails) {
          throw new BadRequestError({
            message: 'No package found',
          })
        }

        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
        })

        const { subscriptionID } =
          appDetails.externalAppDataPackageDefinition.packageDetails
        await cancelSubscription({
          subscriptionID,
          stripeClient,
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
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsSubscriptionModalOpen(false)
    }
  }, [fetcher])

  return (
    <>
      {fetcher.state !== 'idle' && <Loader />}
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
          currentPackage={
            appDetails.externalAppDataPackageDefinition?.packageDetails
              .packageType
          }
          topUp={appDetails.externalAppDataPackageDefinition?.autoTopUp}
          currentPrice={
            appDetails.externalAppDataPackageDefinition?.packageDetails.price
          }
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
                  <Menu>
                    <Menu.Button>
                      <div
                        className="w-8 h-8 flex justify-center items-center cursor-pointer
          hover:bg-gray-100 hover:rounded-[6px]"
                      >
                        <HiDotsVertical className="text-lg text-gray-400" />
                      </div>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100
          rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y
           divide-gray-100"
                      >
                        <div className="p-1 ">
                          <div
                            onClick={() => {
                              setIsSubscriptionModalOpen(true)
                            }}
                            className="cursor-pointer"
                          >
                            <Menu.Item
                              as="div"
                              className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                  hover:rounded-[6px] hover:bg-gray-100"
                            >
                              <HiOutlinePencilAlt className="text-xl font-normal text-gray-400" />
                              <Text
                                size="sm"
                                weight="normal"
                                className="text-gray-700"
                              >
                                Edit Package
                              </Text>
                            </Menu.Item>
                          </div>
                        </div>

                        <div className="p-1">
                          <Menu.Item
                            as="div"
                            className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                hover:rounded-[6px] hover:bg-gray-100 "
                            onClick={() => {
                              setIsCancelModalOpen(true)
                            }}
                          >
                            <HiOutlineTrash className="text-xl font-normal text-red-500" />

                            <Text
                              size="sm"
                              weight="normal"
                              className="text-red-500"
                            >
                              Cancel Service
                            </Text>
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
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
