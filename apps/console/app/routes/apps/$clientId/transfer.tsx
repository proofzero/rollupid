import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { Text } from '@proofzero/design-system'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import { BadRequestError } from '@proofzero/errors'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { Listbox, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { AppLoaderData } from '~/root'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'
import _ from 'lodash'
import { ServicePlanType } from '@proofzero/types/billing'
import {
  StripeInvoice,
  createOrUpdateSubscription,
  process3DSecureCard,
} from '~/utils/billing'
import Stripe from 'stripe'
import plans from '~/utils/plans'
import { getEmailIcon } from '@proofzero/utils/getNormalisedConnectedAccounts'
import {
  Dropdown,
  DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { redirectToPassport } from '~/utils'
import { HiOutlineMail, HiOutlineX } from 'react-icons/hi'
import { AccountURN } from '@proofzero/urns/account'
import { appDetailsProps } from '~/types'
import { GroupAppTransferInfo } from '~/routes/api/group-app-transfer-info'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import dangerVector from '~/images/danger.svg'

type GroupModel = {
  name: string
  URN: IdentityGroupURN
  flags: {
    billingConfigured: boolean
  }
}

type LoaderData = {
  identityGroups: GroupModel[]
  STRIPE_PUBLISHABLE_KEY: string
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const identityGroups = await coreClient.identity.listIdentityGroups.query()
    const mappedIdentityGroups = identityGroups.map(({ name, URN, flags }) => ({
      name,
      URN,
      flags,
    }))

    return json<LoaderData>({
      identityGroups: mappedIdentityGroups,
      STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const groupURN = fd.get('identityGroup[URN]') as
      | IdentityGroupURN
      | undefined
    if (!groupURN) {
      throw new BadRequestError({
        message: 'identityGroup[URN] is required',
      })
    }

    const clientID = params.clientId as string

    const emailURN = fd.get('emailURN') as AccountURN | undefined

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: clientID,
    })

    if (appDetails.published && !emailURN) {
      throw new BadRequestError({
        message: 'emailURN is required',
      })
    }

    if (appDetails.appPlan !== ServicePlanType.FREE) {
      const spd = await coreClient.billing.getStripePaymentData.query({
        URN: groupURN,
      })
      if (!spd.paymentMethodID) {
        throw new BadRequestError({
          message: 'Group has no payment method configured',
        })
      }

      const entitlements = await coreClient.billing.getEntitlements.query({
        URN: groupURN,
      })

      const groupApps = await coreClient.starbase.listGroupApps.query()
      const currentGroupApps = groupApps.filter((a) => a.groupURN === groupURN)
      const currentGroupPlanApps = currentGroupApps.filter(
        (a) => a.appPlan === appDetails.appPlan
      )

      if (
        (entitlements.plans[appDetails.appPlan]?.entitlements ?? 0) -
          currentGroupPlanApps.length <=
        0
      ) {
        const quantity = entitlements.subscriptionID
          ? entitlements.plans[appDetails.appPlan]?.entitlements
            ? entitlements.plans[appDetails.appPlan]?.entitlements! + 1
            : 1
          : 1

        const sub = await createOrUpdateSubscription({
          customerID: spd.customerID,
          planID: context.env.SECRET_STRIPE_PRO_PLAN_ID,
          SECRET_STRIPE_API_KEY: context.env.SECRET_STRIPE_API_KEY,
          quantity,
          subscriptionID: entitlements.subscriptionID,
          URN: groupURN,
        })

        const invoiceStatus = (sub.latest_invoice as Stripe.Invoice)?.status

        let toastSession = await getFlashSession(request, context.env)

        if (
          (sub.status === 'active' || sub.status === 'trialing') &&
          invoiceStatus === 'paid'
        ) {
          await coreClient.billing.updateEntitlements.mutate({
            URN: groupURN,
            subscriptionID: sub.id,
            quantity: quantity,
            type: appDetails.appPlan,
          })

          toastSession = await appendToastToFlashSession(
            request,
            {
              message: `Entitlement successfully purchased`,
              type: ToastType.Success,
            },
            context.env
          )

          return json(
            {
              paymentSuccesful: true,
            },
            {
              headers: {
                'Set-Cookie': await commitFlashSession(
                  toastSession,
                  context.env
                ),
              },
            }
          )
        } else {
          if (
            (sub.latest_invoice as unknown as StripeInvoice)?.payment_intent
              ?.status === 'requires_action'
          ) {
            await coreClient.billing.updateEntitlements.mutate({
              URN: groupURN,
              subscriptionID: sub.id,
              quantity: quantity - 1,
              type: appDetails.appPlan,
            })

            toastSession = await appendToastToFlashSession(
              request,
              {
                message: `Payment requires additional action`,
                type: ToastType.Warning,
              },
              context.env
            )

            let status, client_secret, payment_method
            ;({ status, client_secret, payment_method } = (
              sub.latest_invoice as Stripe.Invoice
            ).payment_intent as Stripe.PaymentIntent)

            return json(
              {
                subId: sub.id,
                status,
                client_secret,
                payment_method,
                clientID,
              },
              {
                headers: {
                  'Set-Cookie': await commitFlashSession(
                    toastSession,
                    context.env
                  ),
                },
              }
            )
          } else {
            toastSession = await appendToastToFlashSession(
              request,
              {
                message: `Payment failed - correct the failed transaction in Billing & Invoicing and retry application transfer`,
                type: ToastType.Error,
              },
              context.env
            )

            return new Response(null, {
              headers: {
                'Set-Cookie': await commitFlashSession(
                  toastSession,
                  context.env
                ),
              },
            })
          }
        }
      }
    }

    try {
      await coreClient.starbase.transferAppToGroup.mutate({
        clientID: clientID,
        identityGroupURN: groupURN,
        emailURN,
      })

      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Application transferred.`,
          type: ToastType.Success,
        },
        context.env
      )

      return redirect(`/groups/${groupURN.split('/')[1]}`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    } catch (ex) {
      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an issue transferring the application. Please try again.`,
          type: ToastType.Error,
        },
        context.env
      )

      return redirect(`/apps/${params.clientId}/transfer`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    }
  }
)

const TransferAppModal = ({
  isOpen,
  handleClose,
  appClientID,
  appName,
  groupURN,
  emailURN,
}: {
  isOpen: boolean
  handleClose: () => void
  appClientID: string
  appName: string
  groupURN: IdentityGroupURN
  emailURN: AccountURN | undefined
}) => {
  const [name, setName] = useState('')

  const clearStateAndHandleClose = () => {
    setName('')
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} handleClose={() => clearStateAndHandleClose()}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <Form
          method="post"
          action={`/apps/${appClientID}/transfer`}
          className="flex-1"
          onSubmit={() => clearStateAndHandleClose()}
        >
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Transfer Application
            </Text>
            <button
              type="button"
              className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
              onClick={() => {
                handleClose()
              }}
              tabIndex={-1}
            >
              <HiOutlineX />
            </button>
          </div>

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Are you sure you want to transfer <b>{appName}</b>?
            </Text>
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Confirm you want to transfer this application by typing its name
              below.
            </Text>
            <Input
              id="app_name"
              label="Application Name"
              placeholder={appName}
              required
              className="mb-12"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <input type="hidden" value={groupURN} name="identityGroup[URN]" />
            {emailURN && (
              <input type="hidden" value={emailURN} name="emailURN" />
            )}
          </section>

          <div className="flex justify-end items-center space-x-3">
            <Button btnType="secondary-alt">Cancel</Button>
            <Button
              type="submit"
              btnType="dangerous"
              disabled={appName !== name}
            >
              Transfer
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default () => {
  const { identityGroups, STRIPE_PUBLISHABLE_KEY } = useLoaderData<LoaderData>()
  const { appDetails, apps, PASSPORT_URL } = useOutletContext<{
    appDetails: appDetailsProps
    apps: AppLoaderData[]
    PASSPORT_URL: string
  }>()
  const actionData = useActionData()

  const [selectedGroup, setSelectedGroup] = useState<GroupModel>()

  const [needsGroupBilling, setNeedsGroupBilling] = useState(false)
  const [needsEntitlement, setNeedsEntitlement] = useState(false)

  const [selectedEmailURN, setSelectedEmailURN] = useState<AccountURN>()

  const submit = useSubmit()

  const groupInfoFetcher = useFetcher<GroupAppTransferInfo>()
  const transition = useTransition()

  useEffect(() => {
    setSelectedEmailURN(undefined)

    if (!selectedGroup) {
      return
    }

    groupInfoFetcher.submit(
      {
        URN: selectedGroup.URN,
      },
      {
        method: 'post',
        action: `/api/group-app-transfer-info`,
      }
    )
  }, [selectedGroup])

  useEffect(() => {
    if (!selectedGroup) {
      setNeedsEntitlement(false)
      setNeedsGroupBilling(false)

      return
    }

    if (!groupInfoFetcher.data) {
      return
    }

    const { entitlements, hasPaymentMethod } = groupInfoFetcher.data

    if (appDetails.appPlan !== ServicePlanType.FREE) {
      if (!hasPaymentMethod) {
        setNeedsGroupBilling(true)
      } else {
        if (
          (entitlements.plans[appDetails.appPlan]?.entitlements ?? 0) -
            apps.filter(
              (a) =>
                a.groupID === selectedGroup.URN.split('/')[1] &&
                a.appPlan === appDetails.appPlan
            ).length <=
          0
        ) {
          setNeedsEntitlement(true)
        }
      }
    }
  }, [groupInfoFetcher])

  useEffect(() => {
    if (actionData && selectedGroup) {
      if (actionData.paymentSuccesful) {
        setNeedsGroupBilling(false)
        setNeedsEntitlement(false)
      } else {
        const { status, client_secret, payment_method, subId } = actionData
        process3DSecureCard({
          submit,
          subId,
          STRIPE_PUBLISHABLE_KEY,
          status,
          client_secret,
          payment_method,
          redirectUrl: `/apps/${appDetails.clientId}/transfer/`,
          URN: selectedGroup.URN,
        })
      }
    }
  }, [actionData])

  const [showTransferModal, setShowTransferModal] = useState(false)

  const availableIdentityGroups = identityGroups.filter(
    (ig) => ig.URN !== appDetails.ownerURN
  )

  return (
    <>
      {groupInfoFetcher.data && selectedGroup && appDetails.clientId && (
        <TransferAppModal
          appClientID={appDetails.clientId}
          appName={appDetails.app.name}
          groupURN={selectedGroup.URN}
          emailURN={selectedEmailURN}
          isOpen={showTransferModal}
          handleClose={() => setShowTransferModal(false)}
        />
      )}
      <section className="mb-[87px]">
        <Text size="2xl" weight="semibold">
          Transfer Application
        </Text>

        <div className="flex flex-row gap-2 items-center mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <g clipPath="url(#clip0_14155_25188)">
              <path
                d="M6.82538 2.63765L1.21071 12.011C1.09503 12.2114 1.03383 12.4387 1.03321 12.6702C1.03258 12.9016 1.09255 13.1292 1.20715 13.3303C1.32175 13.5314 1.48699 13.699 1.68644 13.8164C1.88589 13.9338 2.11261 13.997 2.34404 13.9996H13.574C13.8055 13.997 14.0322 13.9338 14.2316 13.8164C14.4311 13.699 14.5963 13.5314 14.7109 13.3303C14.8255 13.1292 14.8855 12.9016 14.8849 12.6702C14.8843 12.4387 14.8231 12.2114 14.7074 12.011L9.09204 2.63765C8.97381 2.44297 8.80742 2.28204 8.60891 2.17035C8.41041 2.05867 8.18648 2 7.95871 2C7.73094 2 7.50702 2.05867 7.30851 2.17035C7.11001 2.28204 6.94362 2.44297 6.82538 2.63765Z"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V8.66667"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11.3335H8.006"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_14155_25188">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <Text size="sm" className="text-gray-500">
            Proceed with caution! Once the transfer is completed application
            cannot be transferred back to your personal account.
          </Text>
        </div>
      </section>

      <section className="flex justify-center items-center">
        <Form className="flex flex-col gap-4 w-[464px]" method="post">
          <Input
            id="app_name"
            label="Application to Transfer"
            readOnly
            disabled
            value={`${appDetails.app.name}${
              IdentityGroupURNSpace.is(appDetails.ownerURN)
                ? ` (${
                    identityGroups.find((g) => g.URN === appDetails.ownerURN)
                      ?.name
                  })`
                : ''
            }`}
          />

          <Listbox
            value={selectedGroup}
            onChange={setSelectedGroup}
            name="identityGroup"
            disabled={
              availableIdentityGroups.length === 0 ||
              groupInfoFetcher.state !== 'idle'
            }
          >
            {({ open }) => (
              <div className="flex flex-col col-span-2 z-10">
                <Listbox.Button className="relative border rounded-lg py-2 px-3 flex flex-row justify-between items-center flex-1 focus-visible:outline-none focus:border-indigo-500 bg-white disabled:bg-gray-100 px-2 border-gray-300">
                  {availableIdentityGroups.length > 0 && (
                    <>
                      {selectedGroup && (
                        <div className="flex flex-row items-center gap-2">
                          <div className="rounded-full w-5 h-5 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden">
                            <Text size="xs" className="text-gray-500">
                              {selectedGroup.name.substring(0, 1)}
                            </Text>
                          </div>

                          <Text
                            size="sm"
                            weight="normal"
                            className="text-gray-800"
                          >
                            {selectedGroup.name}
                          </Text>
                        </div>
                      )}

                      {!selectedGroup && (
                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-400"
                        >
                          Select a Group
                        </Text>
                      )}
                    </>
                  )}

                  {availableIdentityGroups.length === 0 && (
                    <Text size="sm" weight="normal" className="text-gray-500">
                      No Groups Available
                    </Text>
                  )}

                  {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </Listbox.Button>

                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options
                    className="absolute bg-white p-2 flex flex-col gap-2 mt-1 focus-visible:ring-0 focus-visible:outline-none border shadow w-full"
                    static
                  >
                    {identityGroups
                      .filter((ig) => ig.URN !== appDetails.ownerURN)
                      .map((ig) => (
                        <Listbox.Option
                          key={ig.URN}
                          value={ig}
                          className={({ active }) =>
                            classNames(
                              'flex flex-row items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-lg cursor-pointer',
                              {
                                'bg-gray-100': active,
                              }
                            )
                          }
                        >
                          {({ selected }) => (
                            <article className="flex flex-row items-center justify-between">
                              <div className="flex flex-row items-center gap-2">
                                <div className="rounded-full w-5 h-5 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden">
                                  <Text size="xs" className="text-gray-500">
                                    {ig.name.substring(0, 1)}
                                  </Text>
                                </div>

                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-800"
                                >
                                  {ig.name}
                                </Text>
                              </div>

                              {selected && (
                                <CheckIcon
                                  className="h-5 w-5 text-indigo-600"
                                  aria-hidden="true"
                                />
                              )}
                            </article>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>

          {groupInfoFetcher.data && appDetails.published && (
            <div className="self-start w-full">
              {groupInfoFetcher.data.connectedEmails &&
                groupInfoFetcher.data.connectedEmails.length === 0 && (
                  <Button
                    onClick={() =>
                      redirectToPassport({
                        PASSPORT_URL,
                        login_hint: 'email',
                        rollup_action: `groupemailconnect_${
                          selectedGroup?.URN.split('/')[1]
                        }`,
                      })
                    }
                    btnSize="xs"
                    btnType="secondary-alt"
                    className="w-full"
                  >
                    <div className="flex space-x-3 items-center">
                      <HiOutlineMail className="w-6 h-6 text-gray-800" />
                      <Text
                        weight="medium"
                        className="flex-1 text-gray-800 text-left"
                      >
                        Connect Email Account
                      </Text>
                    </div>
                  </Button>
                )}

              {groupInfoFetcher.state === 'idle' &&
                groupInfoFetcher.data.connectedEmails &&
                groupInfoFetcher.data.connectedEmails.length > 0 && (
                  <>
                    <input
                      name="emailURN"
                      type="hidden"
                      value={selectedEmailURN}
                      required
                    />

                    <Dropdown
                      items={(
                        groupInfoFetcher.data
                          .connectedEmails as DropdownSelectListItem[]
                      ).map((email) => {
                        email.value === ''
                          ? (email.selected = true)
                          : (email.selected = false)
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
                      ConnectButtonCallback={() =>
                        redirectToPassport({
                          PASSPORT_URL,
                          login_hint: 'email',
                          rollup_action: `groupemailconnect_${
                            selectedGroup?.URN.split('/')[1]
                          }`,
                        })
                      }
                      ConnectButtonPhrase="Connect New Email Address"
                      onSelect={(selected) => {
                        if (!Array.isArray(selected)) {
                          if (!selected || !selected.value) {
                            console.error('Error selecting email, try again')
                            return
                          }

                          setSelectedEmailURN(selected.value as AccountURN)
                        }
                      }}
                      disabled={groupInfoFetcher.state !== 'idle'}
                    />
                  </>
                )}
            </div>
          )}

          {!needsEntitlement && (
            <Button
              btnType="primary-alt"
              type="button"
              className="w-full"
              disabled={
                availableIdentityGroups.length === 0 ||
                needsGroupBilling ||
                !selectedGroup ||
                (appDetails.published && !selectedEmailURN) ||
                groupInfoFetcher.state !== 'idle' ||
                transition.state !== 'idle'
              }
              onClick={() => {
                setShowTransferModal(true)
              }}
            >
              Transfer Application
            </Button>
          )}

          {needsEntitlement && (
            <Button
              btnType="primary-alt"
              type="submit"
              className="w-full"
              disabled={
                availableIdentityGroups.length === 0 ||
                needsGroupBilling ||
                !selectedGroup ||
                (appDetails.published && !selectedEmailURN) ||
                groupInfoFetcher.state !== 'idle' ||
                transition.state !== 'idle'
              }
            >
              Purchase Entitlement
            </Button>
          )}

          {availableIdentityGroups.length === 0 && (
            <article className="p-4 bg-orange-50 rounded-lg">
              <section className="mb-3 flex flex-row items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.9993 7.5V9.16667M9.9993 12.5H10.0076M4.22579 15.8333H15.7728C17.0558 15.8333 17.8577 14.4444 17.2162 13.3333L11.4427 3.33333C10.8012 2.22222 9.19742 2.22222 8.55592 3.33333L2.78242 13.3333C2.14092 14.4444 2.94279 15.8333 4.22579 15.8333Z"
                    stroke="#FB923C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Text size="sm" className="text-orange-600">
                  No Group to transfer into
                </Text>
              </section>

              <Text size="sm" className="text-gray-700 mb-3">
                There is no group you can transfer the application into. <br />
                Please create a new Group using the link bellow if you want to
                transfer the application.
              </Text>

              <Link to={`/groups`}>
                <Text size="sm" className="text-orange-600">
                  Create new Group →
                </Text>
              </Link>
            </article>
          )}

          {groupInfoFetcher.data && selectedGroup && needsEntitlement && (
            <article className="p-4 bg-gray-100 rounded-lg">
              <section className="flex flex-row items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.8333 13.3333H10V10H9.16667M10 6.66667H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Text size="sm" className="text-gray-700">
                  Application you are trying to transfer is on{' '}
                  <Text size="sm" type="span" weight="semibold">
                    Pro Plan
                  </Text>
                  .<br /> There are{' '}
                  <Text size="sm" type="span" weight="semibold">
                    {(groupInfoFetcher.data.entitlements.plans[
                      appDetails.appPlan
                    ]?.entitlements ?? 0) -
                      apps.filter(
                        (a) =>
                          a.groupID === selectedGroup.URN.split('/')[1] &&
                          a.appPlan === appDetails.appPlan
                      ).length}{' '}
                    {plans[appDetails.appPlan].title} Entitlements
                  </Text>{' '}
                  available in your group.{' '}
                </Text>
              </section>
            </article>
          )}

          {groupInfoFetcher.data && selectedGroup && needsGroupBilling && (
            <article className="p-4 bg-orange-50 rounded-lg">
              <section className="mb-3 flex flex-row items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.9993 7.5V9.16667M9.9993 12.5H10.0076M4.22579 15.8333H15.7728C17.0558 15.8333 17.8577 14.4444 17.2162 13.3333L11.4427 3.33333C10.8012 2.22222 9.19742 2.22222 8.55592 3.33333L2.78242 13.3333C2.14092 14.4444 2.94279 15.8333 4.22579 15.8333Z"
                    stroke="#FB923C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Text size="sm" className="text-orange-600">
                  Please add Billing Information
                </Text>
              </section>

              <Text size="sm" className="text-gray-700 mb-3">
                We are missing Billing contact information for the group. <br />
                Please use the link below to add the information.
              </Text>

              <Link to={`/billing/groups/${selectedGroup.URN.split('/')[1]}`}>
                <Text size="sm" className="text-orange-600">
                  Add Billing Information →
                </Text>
              </Link>
            </article>
          )}
        </Form>
      </section>
    </>
  )
}
