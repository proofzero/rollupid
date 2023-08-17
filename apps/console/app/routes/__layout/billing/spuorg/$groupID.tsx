import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  type ActionFunction,
  type LoaderFunction,
  json,
} from '@remix-run/cloudflare'
import { FaCheck, FaTrash } from 'react-icons/fa'
import {
  HiChevronDown,
  HiChevronUp,
  HiMinus,
  HiOutlineCreditCard,
  HiOutlineMail,
  HiPlus,
  HiOutlineShoppingCart,
  HiArrowUp,
  HiOutlineX,
} from 'react-icons/hi'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createCoreClient, {
  type CoreClientType,
} from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import {
  type FetcherWithComponents,
  Link,
  NavLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  type SubmitFunction,
} from '@remix-run/react'
import type { AppLoaderData, LoaderData as OutletContextData } from '~/root'
import { Popover, Transition } from '@headlessui/react'
import { Listbox } from '@headlessui/react'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'
import { type AccountURN } from '@proofzero/urns/account'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { HiArrowNarrowRight } from 'react-icons/hi'
import {
  getEmailDropdownItems,
  getEmailIcon,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import {
  Dropdown,
  type DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'
import { reconcileAppSubscriptions } from '~/services/billing/stripe'
import { useHydrated } from 'remix-utils'
import _ from 'lodash'
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '@proofzero/errors'
import iSvg from '@proofzero/design-system/src/atoms/info/i.svg'
import {
  createOrUpdateSubscription,
  getCurrentAndUpcomingInvoices,
  process3DSecureCard,
  UnpaidInvoiceNotification,
  type StripeInvoice,
} from '~/utils/billing'
import { IoWarningOutline } from 'react-icons/io5'
import { type ToastNotification } from '~/types'
import { setPurchaseToastNotification } from '~/utils'
import type Stripe from 'stripe'
import { ToastWarning } from '@proofzero/design-system/src/atoms/toast/ToastWarning'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import plans, { PlanDetails } from '../plans'
import { PaymentData, ServicePlanType } from '@proofzero/types/billing'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { PlanFeatures } from '../personal'
import { IdentityURN } from '@proofzero/urns/identity'

type LoaderData = {
  STRIPE_PUBLISHABLE_KEY: string
  paymentData?: PaymentData
  entitlements: {
    [ServicePlanType.PRO]: number
  }
  toastNotification?: ToastNotification
  connectedEmails: DropdownSelectListItem[]
  invoices: StripeInvoice[]
  groupURN: IdentityGroupURN
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const authorized =
      await coreClient.identity.hasIdentityGroupAuthorization.query({
        identityURN,
        identityGroupURN: groupURN,
      })

    if (!authorized) {
      throw new UnauthorizedError({
        message: 'You are not authorized to update this identity group.',
      })
    }

    const { plans } = await coreClient.billing.getEntitlements.query({
      URN: groupURN,
    })

    const flashSession = await getFlashSession(request, context.env)

    let toastNotification = undefined
    const toastStr = flashSession.get('toast_notification')
    if (toastStr) {
      toastNotification = JSON.parse(toastStr)
    }

    const connectedAccounts = await coreClient.identity.getAccounts.query({
      identity: identityURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: groupURN,
    })
    if (spd && !spd.accountURN) {
      const targetAccountURN =
        await coreClient.account.getAccountURNForEmail.query(
          spd.email.toLowerCase()
        )

      if (!targetAccountURN) {
        throw new InternalServerError({
          message: 'No address found for email',
        })
      }

      await coreClient.billing.setStripePaymentData.mutate({
        ...spd,
        accountURN: targetAccountURN,
        URN: groupURN,
      })

      spd.accountURN = targetAccountURN
    }

    const invoices = (
      await getCurrentAndUpcomingInvoices(
        spd,
        context.env.SECRET_STRIPE_API_KEY
      )
    ).slice(0, 7)

    return json<LoaderData>(
      {
        STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
        paymentData: spd,
        entitlements: {
          [ServicePlanType.PRO]:
            plans?.[ServicePlanType.PRO]?.entitlements ?? 0,
        },
        connectedEmails,
        invoices,
        toastNotification,
        groupURN,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient: CoreClientType = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const authorized =
      await coreClient.identity.hasIdentityGroupAuthorization.query({
        identityURN,
        identityGroupURN: groupURN,
      })

    if (!authorized) {
      throw new UnauthorizedError({
        message: 'You are not authorized to update this identity group.',
      })
    }

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: groupURN,
    })

    const invoices = await getCurrentAndUpcomingInvoices(
      spd,
      context.env.SECRET_STRIPE_API_KEY
    )

    const flashSession = await getFlashSession(request, context.env)

    await UnpaidInvoiceNotification({
      invoices,
      flashSession,
      env: context.env,
    })

    const fd = await request.formData()
    const { customerID, quantity, txType } = JSON.parse(
      fd.get('payload') as string
    ) as {
      customerID: string
      quantity: number
      txType: 'buy' | 'remove'
    }

    const apps = await coreClient.starbase.listApps.query()
    const assignedEntitlementCount = apps.filter(
      (a) => a.appPlan === ServicePlanType.PRO
    ).length
    if (assignedEntitlementCount > quantity) {
      throw new BadRequestError({
        message: `Invalid quantity. Change ${
          quantity - assignedEntitlementCount
        } of the ${assignedEntitlementCount} apps to a different plan first.`,
      })
    }

    if ((quantity < 1 && txType === 'buy') || quantity < 0) {
      throw new BadRequestError({
        message: `Invalid quantity. Please enter a valid number of entitlements.`,
      })
    }

    const entitlements = await coreClient.billing.getEntitlements.query({
      URN: groupURN,
    })

    const sub = await createOrUpdateSubscription({
      customerID,
      SECRET_STRIPE_PRO_PLAN_ID: context.env.SECRET_STRIPE_PRO_PLAN_ID,
      SECRET_STRIPE_API_KEY: context.env.SECRET_STRIPE_API_KEY,
      quantity,
      subscriptionID: entitlements.subscriptionID,
      URN: groupURN,
    })

    if (
      (txType === 'buy' &&
        (sub.status === 'active' || sub.status === 'trialing')) ||
      txType !== 'buy'
    ) {
      await reconcileAppSubscriptions(
        {
          subscriptionID: sub.id,
          URN: groupURN,
          coreClient,
          billingURL: `${context.env.CONSOLE_URL}/billing`,
          settingsURL: `${context.env.CONSOLE_URL}`,
        },
        context.env
      )
    }

    if (txType === 'buy') {
      setPurchaseToastNotification({
        sub,
        flashSession,
      })
    }
    if (txType === 'remove') {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Success,
          message: 'Entitlement(s) successfully removed',
        })
      )
    }

    let status, client_secret, payment_method
    if (
      sub.latest_invoice &&
      (sub.latest_invoice as Stripe.Invoice).payment_intent
    ) {
      // lots of stripe type casting since by default many
      // props are strings (not expanded versions)
      ;({ status, client_secret, payment_method } = (
        sub.latest_invoice as Stripe.Invoice
      ).payment_intent as Stripe.PaymentIntent)
    }

    return json(
      {
        status,
        client_secret,
        payment_method,
        subId: sub.id,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)

const PurchaseProModal = ({
  isOpen,
  setIsOpen,
  plan,
  entitlements,
  paymentData,
  submit,
  URN,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  entitlements: number
  paymentData?: PaymentData
  submit: SubmitFunction
  URN: IdentityGroupURN
}) => {
  const [proEntitlementDelta, setProEntitlementDelta] = useState(1)

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        {!paymentData?.paymentMethodID ? (
          <section className="mx-5 mt-5">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment?URN=${URN}`}
              type={'warning'}
              linkText="Update payment information"
            />
          </section>
        ) : null}

        <div className="flex flex-row justify-between w-full pb-2 pt-5 px-5 items-center">
          <Text
            size="lg"
            weight="semibold"
            className="text-left text-gray-800 "
          >
            Purchase Entitlement(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        <section className="mx-5 mb-5 border rounded-lg overflow-auto thin-scrollbar">
          <div className="p-6">
            <Text
              size="lg"
              weight="semibold"
              className="text-gray-900 text-left"
            >
              {plan.title}
            </Text>

            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 text-left mb-6"
            >
              {plan.description}
            </Text>

            <PlanFeatures plan={plan} featuresColor="text-indigo-500" />
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <div>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Number of Entitlements
              </Text>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-500 text-left"
              >
                {proEntitlementDelta} x ${plan.price}/month
              </Text>
            </div>

            <div className="flex flex-row">
              <button
                type="button"
                className="flex justify-center items-center border
              disabled:cursor-not-allowed
              border-gray-300 bg-gray-50 rounded-l-lg px-4"
                onClick={() => {
                  setProEntitlementDelta((prev) => prev - 1)
                }}
                disabled={proEntitlementDelta <= 1}
              >
                <HiMinus />
              </button>

              <input
                type="text"
                className="border border-x-0 text-center w-[4rem] border-gray-300 focus:ring-0 focus:outline-0 focus:border-gray-300"
                readOnly
                value={proEntitlementDelta}
              />

              <button
                type="button"
                className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-r-lg px-4"
                onClick={() => {
                  setProEntitlementDelta((prev) => prev + 1)
                }}
              >
                <HiPlus />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <Text size="sm" weight="medium" className="text-gray-800 text-left">
              Changes to your subscription
            </Text>

            <div className="flex flex-row gap-2 items-center">
              <Text size="lg" weight="semibold" className="text-gray-900">{`+$${
                plan.price * proEntitlementDelta
              }`}</Text>
              <Text size="sm" weight="medium" className="text-gray-500">
                per month
              </Text>
            </div>
          </div>
        </section>

        <div className="flex-1"></div>

        <section className="flex flex-row-reverse gap-4 m-5 mt-auto">
          <Button
            btnType="primary-alt"
            disabled={!paymentData?.paymentMethodID}
            onClick={() => {
              setIsOpen(false)
              setProEntitlementDelta(1)
              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: entitlements + proEntitlementDelta,
                    customerID: paymentData?.customerID,
                    txType: 'buy',
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          >
            Purchase
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

const AssignEntitlementModal = ({
  isOpen,
  setIsOpen,
  entitlements,
  paymentData,
  entitlementUsage,
  fetcher,
  apps,
  URN,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  entitlements: number
  entitlementUsage: number
  paymentData?: PaymentData
  fetcher: FetcherWithComponents<any>
  apps: AppLoaderData[]
  URN: IdentityGroupURN
}) => {
  const navigate = useNavigate()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        {!paymentData?.paymentMethodID ? (
          <section className="mx-5 mt-5">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment?URN=${URN}`}
              type={'warning'}
              linkText="Update payment information"
            />
          </section>
        ) : null}
        <div
          className="pb-2 pt-5 px-5
      flex flex-row items-start justify-between w-full"
        >
          <div className="flex flex-col items-start">
            <Text
              size="lg"
              weight="semibold"
              className="text-left text-gray-800"
            >
              Assign Entitlement(s)
            </Text>
            <Text className="text-left text-gray-500">
              {entitlementUsage} of {entitlements} Entitlements used
            </Text>
          </div>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>
        <div className="mb-5 w-full">
          <section className="border-t thin-scrollbar w-full my-4">
            <ul>
              {apps.map((app) => {
                return (
                  <li
                    key={app.clientId}
                    className="flex flex-row items-center justify-between
                py-1.5 border-b px-5"
                  >
                    <div className="flex flex-col items-start">
                      <Text>{app.name}</Text>
                      <Text className="text-gray-500">
                        {app.appPlan[0] + app.appPlan.slice(1).toLowerCase()}{' '}
                        Plan
                      </Text>
                    </div>
                    {app.appPlan === ServicePlanType.PRO ? (
                      <Button
                        btnType="secondary-alt"
                        onClick={() => {
                          navigate(`/apps/${app.clientId}/billing`)
                        }}
                      >
                        Manage
                      </Button>
                    ) : (
                      <>
                        {entitlementUsage < entitlements ? (
                          <Button
                            btnType="primary-alt"
                            className="flex flex-row items-center gap-3"
                            onClick={async () => {
                              setIsOpen(false)
                              fetcher.submit(
                                {
                                  op: 'update',
                                  payload: JSON.stringify({
                                    plan: ServicePlanType.PRO,
                                  }),
                                },
                                {
                                  method: 'post',
                                  action: `/apps/${app.clientId}/billing`,
                                }
                              )
                            }}
                          >
                            <HiArrowUp className="w-3.5 h-3.5" />{' '}
                            <Text>
                              Upgrade to{' '}
                              {ServicePlanType.PRO[0] +
                                ServicePlanType.PRO.slice(1).toLowerCase()}
                            </Text>
                          </Button>
                        ) : (
                          <Button
                            btnType="primary-alt"
                            className="flex flex-row items-center gap-3"
                            onClick={() => {
                              setIsOpen(false)
                              fetcher.submit(
                                {
                                  op: 'purchase',
                                  payload: JSON.stringify({
                                    plan: ServicePlanType.PRO,
                                  }),
                                },
                                {
                                  method: 'post',
                                  action: `/apps/${app.clientId}/billing`,
                                }
                              )
                            }}
                            disabled={!paymentData?.paymentMethodID}
                          >
                            <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                            <Text>Purchase Entitlement</Text>
                          </Button>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
          <section className=" px-5 w-full">
            <Button
              className="w-full"
              btnType="secondary-alt"
              onClick={() => {
                navigate('/apps/new')
              }}
            >
              Create New Application
            </Button>
          </section>
        </div>
      </div>
    </Modal>
  )
}

const RemoveEntitelmentModal = ({
  isOpen,
  setIsOpen,
  plan,
  entitlements,
  entitlementUsage,
  paymentData,
  submit,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  entitlements: number
  entitlementUsage: number
  paymentData?: PaymentData
  submit: SubmitFunction
}) => {
  const [proEntitlementNew, setProEntitlementNew] = useState(entitlementUsage)

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div className="pb-2 pt-5 px-5 w-full flex flex-row items-center justify-between">
          <Text size="lg" weight="semibold" className="text-left text-gray-800">
            Remove Entitlement(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>
        <section className="p-5 pt-auto w-full">
          <div className="w-full border rounded-lg overflow-auto thin-scrollbar">
            <div className="p-6">
              <Text
                size="lg"
                weight="semibold"
                className="text-gray-900 text-left"
              >
                {plan.title}
              </Text>
              <ul className="pl-4">
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You are currently using {entitlementUsage}/{entitlements}{' '}
                  {plan.title} entitlements
                </li>
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You can downgrade some of your applications if you'd like to
                  pay for fewer Entitlements.
                </li>
              </ul>
            </div>
            <div className="border-b border-gray-200"></div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-800 text-left"
                >
                  Number of Entitlements
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 text-left"
                >{`${entitlementUsage} x ${
                  plans[ServicePlanType.PRO].price
                }/month`}</Text>
              </div>

              <div className="flex flex-row text-gray-500 space-x-4">
                <div className="flex flex-row items-center space-x-2">
                  <Text size="sm">{entitlements} Entitlements</Text>
                  <HiArrowNarrowRight />
                </div>

                <div className="flex flex-row">
                  <Listbox
                    value={proEntitlementNew}
                    onChange={setProEntitlementNew}
                    disabled={entitlementUsage === entitlements}
                    as="div"
                  >
                    {({ open }) => {
                      return (
                        <div>
                          <Listbox.Button
                            className="relative w-full cursor-default border
                  py-1.5 px-4 text-left sm:text-sm rounded-lg
                  focus:border-indigo-500 focus:outline-none focus:ring-1
                  flex flex-row space-x-3 items-center"
                          >
                            <Text size="sm">{proEntitlementNew}</Text>
                            {open ? (
                              <HiChevronUp className="text-right" />
                            ) : (
                              <HiChevronDown className="text-right" />
                            )}
                          </Listbox.Button>
                          <Transition
                            show={open}
                            as="div"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="bg-gray-800"
                          >
                            <Listbox.Options
                              className="absolute no-scrollbar w-full bg-white
                        rounded-lg border max-h-[200px] max-w-[66.1833px] overflow-auto"
                            >
                              {Array.apply(null, Array(entitlements + 1)).map(
                                (_, i) => {
                                  return (
                                    <Listbox.Option
                                      key={i}
                                      value={i}
                                      className="flex items-center
                                cursor-pointer hover:bg-gray-100
                                rounded-lg m-1"
                                    >
                                      {({ selected }) => {
                                        return (
                                          <div
                                            className={`w-full h-full px-4 py-1.5
                                      rounded-lg ${
                                        selected
                                          ? 'bg-gray-100  font-medium'
                                          : ''
                                      }`}
                                          >
                                            {i}
                                          </div>
                                        )
                                      }}
                                    </Listbox.Option>
                                  )
                                }
                              )}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      )
                    }}
                  </Listbox>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200"></div>

            <div className="p-6 flex justify-between items-center">
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Changes to your subscription
              </Text>

              <div className="flex flex-row gap-2 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">{`${
                  plan.price * (entitlements - proEntitlementNew) !== 0
                    ? '-'
                    : ''
                }$${plan.price * (entitlements - proEntitlementNew)}`}</Text>
                <Text size="sm" weight="medium" className="text-gray-500">
                  per month
                </Text>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-row-reverse gap-4 mt-auto m-5">
          <Button
            btnType="dangerous-alt"
            disabled={
              !paymentData?.paymentMethodID ||
              entitlementUsage === entitlements ||
              proEntitlementNew < entitlementUsage ||
              proEntitlementNew === entitlements
            }
            onClick={() => {
              setIsOpen(false)
              setProEntitlementNew(1)

              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: proEntitlementNew,
                    customerID: paymentData?.customerID,
                    txType: 'remove',
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          >
            Remove Entitlement(s)
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

const AssignedAppModal = ({
  apps,
  isOpen,
  setIsOpen,
}: {
  apps: AppLoaderData[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px]">
        <div className="w-full flex flex-row justify-between items-center pb-2 px-5 pt-5">
          <Text size="lg" weight="semibold" className="text-left text-gray-800">
            Assigned Application(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        <section>
          <ul>
            {apps.map((app) => (
              <li
                key={app.clientId}
                className="flex flex-row items-center justify-between
            p-5 border-t border-gray-200"
              >
                <div className="flex flex-col">
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-900 text-left"
                  >
                    {app.name}
                  </Text>
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 text-left"
                  >
                    {plans[app.appPlan].title}
                  </Text>
                </div>

                <NavLink to={`/apps/${app.clientId}/billing`}>
                  <Button btnType="secondary-alt">Manage</Button>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  )
}

const PlanCard = ({
  plan,
  entitlements,
  apps,
  paymentData,
  submit,
  fetcher,
  hasUnpaidInvoices = false,
  URN,
}: {
  plan: PlanDetails
  entitlements: number
  apps: AppLoaderData[]
  paymentData?: PaymentData
  hasUnpaidInvoices: boolean
  submit: SubmitFunction
  fetcher: FetcherWithComponents<any>
  URN: IdentityGroupURN
}) => {
  const [purchaseProModalOpen, setPurchaseProModalOpen] = useState(false)
  const [removeEntitlementModalOpen, setRemoveEntitlementModalOpen] =
    useState(false)
  const [assignedAppModalOpen, setAssignedAppModalOpen] = useState(false)
  const [assignEntitlementsModalOpen, setAssignEntitlementsModalOpen] =
    useState(false)

  const appsWithAssignedPlan = apps.filter(
    (a) => a.appPlan === ServicePlanType.PRO
  )
  return (
    <>
      <PurchaseProModal
        isOpen={purchaseProModalOpen}
        setIsOpen={setPurchaseProModalOpen}
        plan={plan}
        entitlements={entitlements}
        paymentData={paymentData}
        submit={submit}
        URN={URN}
      />
      <RemoveEntitelmentModal
        isOpen={removeEntitlementModalOpen}
        setIsOpen={setRemoveEntitlementModalOpen}
        plan={plan}
        entitlements={entitlements}
        entitlementUsage={appsWithAssignedPlan.length}
        paymentData={paymentData}
        submit={submit}
      />
      <AssignEntitlementModal
        isOpen={assignEntitlementsModalOpen}
        setIsOpen={setAssignEntitlementsModalOpen}
        entitlements={entitlements}
        entitlementUsage={appsWithAssignedPlan.length}
        paymentData={paymentData}
        fetcher={fetcher}
        apps={apps}
        URN={URN}
      />
      <AssignedAppModal
        isOpen={assignedAppModalOpen}
        setIsOpen={setAssignedAppModalOpen}
        apps={appsWithAssignedPlan}
      />
      <article className="bg-white rounded-lg border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
          <div>
            <Text size="lg" weight="semibold" className="text-gray-900">
              {plan.title}
            </Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              {plan.description}
            </Text>
          </div>

          <div className="flex flex-row items-center space-x-2">
            <Button
              btnType="secondary-alt"
              className={classnames(
                'flex flex-row items-center \
             gap-3',
                hasUnpaidInvoices
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => {
                setPurchaseProModalOpen(true)
              }}
              disabled={hasUnpaidInvoices}
            >
              <HiOutlineShoppingCart className="w-3.5 h-3.5" />

              <Text size="sm" weight="medium">
                Purchase
              </Text>
            </Button>
            <Button
              btnType="primary-alt"
              className={`
                ${
                  hasUnpaidInvoices || fetcher.state !== 'idle'
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer '
                }
              `}
              onClick={() => {
                setAssignEntitlementsModalOpen(true)
              }}
              disabled={hasUnpaidInvoices || fetcher.state !== 'idle'}
            >
              {fetcher.state === 'idle' ? (
                <Text size="sm" weight="medium" className="text-white">
                  Assign Entitlement(s)
                </Text>
              ) : (
                <Spinner />
              )}
            </Button>
          </div>
        </header>
        <div className="w-full border-b border-gray-200"></div>
        <main>
          <div className="flex flex-row gap-7 p-4">
            <PlanFeatures plan={plan} featuresColor="text-indigo-500" />
          </div>

          <div className="border-b border-gray-200"></div>

          {entitlements > 0 && (
            <div className="p-4">
              <div className="flex flex-row items-center gap-6">
                <div className="flex-1">
                  <Text size="sm" weight="medium" className="text-gray-900">
                    Entitlements
                  </Text>

                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (appsWithAssignedPlan.length / entitlements) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      {appsWithAssignedPlan.length > 0 && (
                        <button
                          type="button"
                          className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                          onClick={() => {
                            setAssignedAppModalOpen(true)
                          }}
                        >
                          <Text size="sm" weight="medium">
                            View Assigned Apps
                          </Text>
                        </button>
                      )}
                    </div>
                    <Text size="sm" weight="medium" className="text-gray-500">
                      {`${appsWithAssignedPlan.length} out of ${entitlements} Entitlements used`}
                    </Text>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Text size="lg" weight="semibold" className="text-gray-900">
                    ${entitlements * plans.PRO.price}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    per month
                  </Text>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer>
          {entitlements === 0 && (
            <div className="bg-gray-50 rounded-b-lg py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                onClick={() => {
                  setPurchaseProModalOpen(true)
                }}
              >
                <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                <Text size="sm" weight="medium">
                  Purchase Entitlement(s)
                </Text>
              </button>
            </div>
          )}
          {entitlements > appsWithAssignedPlan.length && (
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b-lg py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                onClick={() => {
                  setRemoveEntitlementModalOpen(true)
                }}
              >
                <FaTrash className="w-3.5 h-3.5" />
                <Text size="sm" weight="medium">
                  Remove Unused Entitlements
                </Text>
              </button>
            </div>
          )}
        </footer>
      </article>
    </>
  )
}

export default () => {
  const loaderData = useLoaderData<LoaderData>()
  const actionData = useActionData()

  const {
    STRIPE_PUBLISHABLE_KEY,
    entitlements,
    toastNotification,
    paymentData,
    connectedEmails,
    invoices,
    groupURN,
  } = loaderData

  const { PASSPORT_URL } = useOutletContext<OutletContextData>()

  const submit = useSubmit()
  const fetcher = useFetcher()

  useEffect(() => {
    // Checking status for 3DS payment authentication
    if (actionData?.status || fetcher.data?.status) {
      const { status, client_secret, payment_method, subId } = actionData
        ? actionData
        : fetcher.data

      let clientId = fetcher.data?.clientId
      process3DSecureCard({
        STRIPE_PUBLISHABLE_KEY,
        status,
        subId,
        client_secret,
        payment_method,
        submit,
        redirectUrl: '/billing',
        updatePlanParams: {
          clientId,
          plan: ServicePlanType.PRO,
        },
      })
    }
  }, [actionData, fetcher.data])

  useEffect(() => {
    if (toastNotification) {
      toast(toastNotification.type, {
        message: toastNotification.message,
      })
    }
  }, [toastNotification])

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

  useConnectResult()

  const [selectedEmail, setSelectedEmail] = useState<string | undefined>(
    paymentData?.email
  )
  const [selectedEmailURN, setSelectedEmailURN] = useState<string | undefined>(
    paymentData?.accountURN
  )
  const [fullName, setFullName] = useState<string | undefined>(
    paymentData?.name
  )

  const hydrated = useHydrated()

  const [invoiceSort, setInvoiceSort] = useState<'asc' | 'desc'>('desc')

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="flex flex-col lg:flex-row items-center justify-between mb-11">
        <div className="flex flex-row items-center space-x-3">
          <Text
            size="2xl"
            weight="semibold"
            className="text-gray-900 ml-2 lg:ml-0 "
          >
            Billing & Invoicing
          </Text>
        </div>
      </section>

      <section>
        {paymentData && !paymentData.paymentMethodID ? (
          <article className="mb-3.5">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment?URN=${groupURN}`}
              type={'warning'}
              linkText="Update payment information"
            />
          </article>
        ) : null}
        {!paymentData ? (
          <article className="mb-3.5">
            <ToastWarning message="Please fill Billing Contact Section" />
          </article>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <article className="bg-white rounded-lg border">
          <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
            <div>
              <div className="flex flex-row gap-4 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">
                  Billing Contact
                </Text>

                {!paymentData && <DangerPill text="Not Configured" />}
              </div>
              <Text size="sm" weight="medium" className="text-gray-500">
                This will be used to create a customer ID and for notifications
                about your billing
              </Text>
            </div>

            <Button
              btnType="primary-alt"
              btnSize="sm"
              disabled={
                !(fullName?.length && selectedEmail?.length) ||
                (paymentData?.name === fullName &&
                  paymentData?.email === selectedEmail)
              }
              onClick={() => {
                submit(
                  {
                    payload: JSON.stringify({
                      name: fullName,
                      email: selectedEmail,
                      addressURN: selectedEmailURN,
                      URN: groupURN,
                    }),
                  },
                  {
                    action: '/billing/details',
                    method: 'post',
                  }
                )
              }}
            >
              Submit
            </Button>
          </header>
          <main className="p-4 flex flex-row gap-4">
            <div className="w-52">
              <Input
                id="full_name"
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                }}
              />
            </div>

            <div className="w-80 flex flex-col justify-end">
              {connectedEmails && connectedEmails.length === 0 && (
                <Button
                  onClick={redirectToPassport}
                  btnType="secondary-alt"
                  className="py-[6px]"
                >
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
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-700 mb-2"
                  >
                    Email
                    <sup>*</sup>
                  </Text>

                  <Dropdown
                    items={(connectedEmails as DropdownSelectListItem[]).map(
                      (email) => {
                        email.value === ''
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
                      }
                    )}
                    placeholder="Select an Email Address"
                    onSelect={(selected) => {
                      // type casting to DropdownSelectListItem instead of array
                      if (!Array.isArray(selected)) {
                        if (!selected || !selected.value) {
                          console.error('Error selecting email, try again')
                          return
                        }

                        setSelectedEmail(selected.title)
                        setSelectedEmailURN(selected.value)
                      }
                    }}
                    ConnectButtonCallback={redirectToPassport}
                    ConnectButtonPhrase="Connect New Email Address"
                    defaultItems={
                      connectedEmails.filter(
                        (ce) => ce.value === paymentData?.accountURN
                      ) as DropdownSelectListItem[]
                    }
                  />
                </>
              )}
            </div>
          </main>
        </article>

        <PlanCard
          plan={plans[ServicePlanType.PRO]}
          entitlements={entitlements[ServicePlanType.PRO]}
          paymentData={paymentData}
          submit={submit}
          apps={[]}
          fetcher={fetcher}
          hasUnpaidInvoices={false}
          URN={groupURN}
        />
      </section>

      <section className="mt-10">
        <article>
          <header className="flex flex-col lg:flex-row justify-between lg:items-center relative mb-6">
            <Text size="lg" weight="semibold" className="text-gray-900">
              Invoices & Payments
            </Text>

            <Link to={`/billing/portal?URN=${groupURN}`}>
              <Button
                btnType="secondary-alt"
                className="flex flex-row items-center gap-2"
              >
                <HiOutlineCreditCard />
                Update payment information
              </Button>
            </Link>
          </header>

          {invoices.length > 0 && (
            <>
              <main className="flex flex-row gap-4 items-center border rounded-lg">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 rounded-t-lg">
                    <tr className="rounded-t-lg">
                      <th className="px-6 py-3 text-left rounded-tl-lg">
                        <button
                          className="flex flex-row gap-2"
                          onClick={() => {
                            setInvoiceSort(
                              invoiceSort === 'desc' ? 'asc' : 'desc'
                            )
                          }}
                        >
                          <Text
                            size="xs"
                            weight="medium"
                            className="uppercase text-gray-500"
                          >
                            Date
                          </Text>

                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.00005 2.40002C8.21222 2.40002 8.41571 2.48431 8.56573 2.63434L10.9657 5.03434C11.2782 5.34676 11.2782 5.85329 10.9657 6.16571C10.6533 6.47813 10.1468 6.47813 9.83436 6.16571L8.00005 4.3314L6.16573 6.16571C5.85331 6.47813 5.34678 6.47813 5.03436 6.16571C4.72194 5.85329 4.72194 5.34676 5.03436 5.03434L7.43436 2.63434C7.58439 2.48431 7.78788 2.40002 8.00005 2.40002ZM5.03436 9.83434C5.34678 9.52192 5.85331 9.52192 6.16573 9.83434L8.00005 11.6687L9.83436 9.83434C10.1468 9.52192 10.6533 9.52192 10.9657 9.83434C11.2782 10.1468 11.2782 10.6533 10.9657 10.9657L8.56573 13.3657C8.25331 13.6781 7.74678 13.6781 7.43436 13.3657L5.03436 10.9657C4.72194 10.6533 4.72194 10.1468 5.03436 9.83434Z"
                              fill="#9CA3AF"
                            />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <Text
                          size="xs"
                          weight="medium"
                          className="uppercase text-gray-500"
                        >
                          Invoice total
                        </Text>
                      </th>
                      <th className="px-6 py-3 text-left rounded-tr-lg">
                        <Text
                          size="xs"
                          weight="medium"
                          className="uppercase text-gray-500"
                        >
                          Status
                        </Text>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="border-t border-gray-200">
                    {invoices
                      .sort((a, b) =>
                        invoiceSort === 'desc'
                          ? b.timestamp - a.timestamp
                          : a.timestamp - b.timestamp
                      )
                      .map((invoice, idx) => (
                        <tr
                          key={idx}
                          className={`${
                            idx === invoices.length - 1 ? '' : 'border-b'
                          } border-gray-200`}
                        >
                          <td className="px-6 py-3">
                            {hydrated && (
                              <div className="flex flex-row items-center space-x-3">
                                <Text size="sm" className="gray-500">
                                  {hydrated &&
                                    new Date(invoice.timestamp).toLocaleString(
                                      'default',
                                      {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      }
                                    )}
                                </Text>

                                {(invoice.status === 'open' ||
                                  invoice.status === 'uncollectible') && (
                                  <div
                                    className="rounded-xl bg-yellow-200 flex
                                flex-row items-center space-x-1 p-1"
                                  >
                                    <IoWarningOutline className="text-black w-4 h-4" />
                                    <Text size="xs" className="text-black">
                                      Payment Error
                                    </Text>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-3">
                            <Text size="sm" className="gray-500">
                              {invoice.amount < 0 ? '-' : ''}$
                              {invoice.amount < 0
                                ? (invoice.amount * -1).toFixed(2)
                                : invoice.amount.toFixed(2)}
                            </Text>
                          </td>

                          <td className="px-6 py-3">
                            <Text size="xs" className="test-gray-500">
                              {invoice.status && _.startCase(invoice.status)}
                            </Text>
                            {invoice.status === 'paid' && (
                              <a
                                href={invoice.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Text size="xs" className="text-indigo-500">
                                  View Invoice
                                </Text>
                              </a>
                            )}
                            {(invoice.status === 'open' ||
                              invoice.status === 'uncollectible') && (
                              <div className="flex flex-row space-x-2">
                                <a
                                  href={invoice.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Text size="xs" className="text-indigo-500">
                                    Update Payment
                                  </Text>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    submit(
                                      {
                                        invoice_id: invoice.id,
                                      },
                                      {
                                        method: 'post',
                                        action: 'billing/cancel',
                                      }
                                    )
                                  }}
                                >
                                  <Text size="xs" className="text-red-500">
                                    Cancel Payment
                                  </Text>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </main>
              <div className="w-full mt-2 text-end">
                <NavLink to={`/billing/portal?URN=${groupURN}`} target="_blank">
                  <Text size="sm" className="text-indigo-500 hover:underline">
                    View invoice history
                  </Text>
                </NavLink>
              </div>
            </>
          )}

          {invoices.length === 0 && (
            <main className="border rounded-lg bg-white flex flex-col justify-center items-center gap-9 py-14">
              <svg
                width="148"
                height="164"
                viewBox="0 0 148 164"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M74 155.893C114.869 155.893 148 122.762 148 81.8926C148 41.0235 114.869 7.89258 74 7.89258C33.1309 7.89258 0 41.0235 0 81.8926C0 122.762 33.1309 155.893 74 155.893Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M116.427 50.3193H31.574C28.8494 50.3193 26.6406 52.5281 26.6406 55.2527V158.853C26.6406 161.577 28.8494 163.786 31.574 163.786H116.427C119.152 163.786 121.361 161.577 121.361 158.853V55.2527C121.361 52.5281 119.152 50.3193 116.427 50.3193Z"
                  fill="white"
                />
                <path
                  d="M64.1348 65.1191H38.4815C36.8467 65.1191 35.5215 66.4444 35.5215 68.0791C35.5215 69.7139 36.8467 71.0391 38.4815 71.0391H64.1348C65.7696 71.0391 67.0948 69.7139 67.0948 68.0791C67.0948 66.4444 65.7696 65.1191 64.1348 65.1191Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 77.9453H38.4815C36.8467 77.9453 35.5215 79.2705 35.5215 80.9053C35.5215 82.5401 36.8467 83.8653 38.4815 83.8653H81.8948C83.5296 83.8653 84.8548 82.5401 84.8548 80.9053C84.8548 79.2705 83.5296 77.9453 81.8948 77.9453Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M64.1348 91.7598H38.4815C36.8467 91.7598 35.5215 93.085 35.5215 94.7198C35.5215 96.3545 36.8467 97.6798 38.4815 97.6798H64.1348C65.7696 97.6798 67.0948 96.3545 67.0948 94.7198C67.0948 93.085 65.7696 91.7598 64.1348 91.7598Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 104.586H38.4815C36.8467 104.586 35.5215 105.911 35.5215 107.546C35.5215 109.181 36.8467 110.506 38.4815 110.506H81.8948C83.5296 110.506 84.8548 109.181 84.8548 107.546C84.8548 105.911 83.5296 104.586 81.8948 104.586Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M64.1348 118.4H38.4815C36.8467 118.4 35.5215 119.726 35.5215 121.36C35.5215 122.995 36.8467 124.32 38.4815 124.32H64.1348C65.7696 124.32 67.0948 122.995 67.0948 121.36C67.0948 119.726 65.7696 118.4 64.1348 118.4Z"
                  fill="#F3F4F6"
                />
                <path
                  d="M81.8948 131.227H38.4815C36.8467 131.227 35.5215 132.552 35.5215 134.187C35.5215 135.821 36.8467 137.147 38.4815 137.147H81.8948C83.5296 137.147 84.8548 135.821 84.8548 134.187C84.8548 132.552 83.5296 131.227 81.8948 131.227Z"
                  fill="#F9FAFB"
                />
                <path
                  d="M116.427 0H31.574C28.8494 0 26.6406 2.20873 26.6406 4.93333V34.5333C26.6406 37.2579 28.8494 39.4667 31.574 39.4667H116.427C119.152 39.4667 121.361 37.2579 121.361 34.5333V4.93333C121.361 2.20873 119.152 0 116.427 0Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M64.1329 10.8535H38.4795C36.8448 10.8535 35.5195 12.1788 35.5195 13.8135C35.5195 15.4483 36.8448 16.7735 38.4795 16.7735H64.1329C65.7676 16.7735 67.0929 15.4483 67.0929 13.8135C67.0929 12.1788 65.7676 10.8535 64.1329 10.8535Z"
                  fill="white"
                />
                <path
                  d="M81.8929 23.6797H38.4795C36.8448 23.6797 35.5195 25.0049 35.5195 26.6397C35.5195 28.2745 36.8448 29.5997 38.4795 29.5997H81.8929C83.5276 29.5997 84.8529 28.2745 84.8529 26.6397C84.8529 25.0049 83.5276 23.6797 81.8929 23.6797Z"
                  fill="white"
                />
              </svg>

              <Text>Your invoices will appear here</Text>
            </main>
          )}
        </article>
      </section>
    </>
  )
}
