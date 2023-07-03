import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  type ActionFunction,
  type LoaderFunction,
  json,
} from '@remix-run/cloudflare'
import { FaCheck, FaShoppingCart, FaTrash } from 'react-icons/fa'
import {
  HiChevronDown,
  HiChevronUp,
  HiMinus,
  HiOutlineCreditCard,
  HiOutlineMail,
  HiPlus,
} from 'react-icons/hi'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import {
  Link,
  NavLink,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import type { AppLoaderData, LoaderData as OutletContextData } from '~/root'
import { Menu, Transition } from '@headlessui/react'
import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { HiOutlineMinusCircle } from 'react-icons/hi'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import { type PaymentData, ServicePlanType } from '@proofzero/types/account'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'
import plans, { type PlanDetails } from './plans'
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
import { ToastInfo } from '@proofzero/design-system/src/atoms/toast/ToastInfo'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'
import {
  createSubscription,
  getInvoices,
  updateSubscription,
} from '~/services/billing/stripe'
import { useHydrated } from 'remix-utils'
import _ from 'lodash'

type LoaderData = {
  paymentData?: PaymentData
  entitlements: {
    [ServicePlanType.PRO]: number
  }
  successToast?: string
  connectedEmails: DropdownSelectListItem[]
  invoices: {
    amount: number
    timestamp: number
    status: string | null
    url?: string
  }[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { plans, subscriptionID } =
      await accountClient.getEntitlements.query()

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    const successToast = flashSession.get('success_toast')

    const connectedAccounts = await accountClient.getAddresses.query({
      account: accountURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    const spd = await accountClient.getStripePaymentData.query({
      accountURN,
    })

    let invoices: {
      amount: number
      timestamp: number
      status: string | null
      url?: string
    }[] = []
    if (subscriptionID) {
      const stripeInvoices = await getInvoices({
        customerID: spd.customerID,
        subscriptionID,
      })

      console.log(JSON.stringify(stripeInvoices.invoices, null, 2))

      invoices = stripeInvoices.invoices.data.map((i) => ({
        amount: i.total / 100,
        timestamp: i.created * 1000,
        status: i.status,
        url: i.hosted_invoice_url ?? undefined,
      }))
      invoices = invoices.concat({
        amount: stripeInvoices.upcomingInvoices.lines.data[0].amount / 100,
        timestamp:
          stripeInvoices.upcomingInvoices.lines.data[0].period.start * 1000,
        status: 'scheduled',
      })
    }

    return json<LoaderData>(
      {
        paymentData: spd,
        entitlements: {
          [ServicePlanType.PRO]:
            plans?.[ServicePlanType.PRO]?.entitlements ?? 0,
        },
        successToast,
        connectedEmails,
        invoices,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession),
        },
      }
    )
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const { customerID, quantity, txType } = JSON.parse(
      fd.get('payload') as string
    ) as {
      customerID: string
      quantity: number
      txType: 'buy' | 'remove'
    }

    const entitlements = await accountClient.getEntitlements.query()

    let sub
    if (!entitlements.subscriptionID) {
      sub = await createSubscription({
        customerID: customerID,
        planID: STRIPE_PRO_PLAN_ID,
        quantity: +quantity,
        accountURN,
        handled: true,
      })
    } else {
      sub = await updateSubscription({
        subscriptionID: entitlements.subscriptionID,
        planID: STRIPE_PRO_PLAN_ID,
        quantity: +quantity,
        handled: true,
      })
    }

    await accountClient.updateEntitlements.mutate({
      accountURN: accountURN,
      subscriptionID: sub.id,
      quantity: +quantity,
      type: ServicePlanType.PRO,
    })

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    if (txType === 'buy') {
      flashSession.flash('success_toast', 'Entitlement(s) successfully bought')
    }
    if (txType === 'remove') {
      flashSession.flash('success_toast', 'Entitlement(s) successfully removed')
    }

    return new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }
)

export const PlanFeatures = ({ plan }: { plan: PlanDetails }) => {
  return (
    <ul className="grid lg:grid-rows-4 grid-flow-row lg:grid-flow-col gap-4">
      {plan.features.map((feature) => (
        <li
          key={feature.title}
          className={`flex flex-row items-center gap-3 text-[#6B7280]`}
        >
          <div className="w-3.5 h-3.5 flex justify-center items-center">
            {feature.type === 'base' && (
              <FaCheck className={`text-indigo-500`} />
            )}
            {feature.type === 'addon' && (
              <FaCheck className={`text-gray-500`} />
            )}
            {feature.type === 'future' && (
              <TbHourglassHigh className="text-gray-500" />
            )}
          </div>

          <Text size="sm" weight="medium">
            {feature.title}
          </Text>
        </li>
      ))}
    </ul>
  )
}

const PurchaseProModal = ({
  isOpen,
  setIsOpen,
  plan,
  entitlements,
  paymentData,
  submit,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  entitlements: number
  paymentData?: PaymentData
  submit: (data: any, options: any) => void
}) => {
  const [proEntitlementDelta, setProEntitlementDelta] = useState(1)

  return (
    <Modal isOpen={isOpen} fixed handleClose={() => setIsOpen(false)}>
      <Text
        size="lg"
        weight="semibold"
        className="text-left text-gray-800 mx-5"
      >
        Purchase Entitlement(s)
      </Text>

      {!paymentData?.paymentMethodID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Update your Payment Information to enable purchasing"
            linkHref={`/gnillib/payment`}
            linkText="Update payment information"
          />
        </section>
      )}

      <section className="m-5 border rounded-lg">
        <div className="p-6">
          <Text size="lg" weight="semibold" className="text-gray-900 text-left">
            {plan.title}
          </Text>

          <Text
            size="sm"
            weight="medium"
            className="text-[#6B7280] text-left mb-6"
          >
            {plan.description}
          </Text>

          <PlanFeatures plan={plan} />
        </div>

        <div className="border-b border-gray-200"></div>

        <div className="p-6 flex justify-between items-center">
          <div>
            <Text size="sm" weight="medium" className="text-gray-800 text-left">
              Number of Entitlements
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-[#6B7280] text-left"
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
              disabled={proEntitlementDelta < 1}
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
  submit: (data: any, options: any) => void
}) => {
  const [proEntitlementNew, setProEntitlementNew] = useState(entitlementUsage)

  return (
    <Modal isOpen={isOpen} fixed handleClose={() => setIsOpen(false)}>
      <Text
        size="lg"
        weight="semibold"
        className="text-left text-gray-800 mx-5"
      >
        Purchase Entitlement(s)
      </Text>
      <section className="m-5 border rounded-lg">
        <div className="p-6">
          <Text size="lg" weight="semibold" className="text-gray-900 text-left">
            {plan.title}
          </Text>
          <ul className="pl-4">
            <li className="list-disc text-sm font-medium text-[#6B7280] text-left">
              You are currently using {entitlementUsage}/{entitlements}{' '}
              {plan.title} entitlements
            </li>
            <li className="list-disc text-sm font-medium text-[#6B7280] text-left">
              You can downgrade some of your applications if you'd like to pay
              for fewer Entitlements.
            </li>
          </ul>
        </div>
        <div className="border-b border-gray-200"></div>
        <div className="p-6 flex justify-between items-center">
          <Text size="sm" weight="medium" className="text-gray-800 text-left">
            Number of Entitlements
          </Text>
          <div className="flex flex-row text-[#6B7280] space-x-4">
            <div className="flex flex-row items-center space-x-2">
              <Text size="sm">{entitlements} Entitlements</Text>
              <HiArrowNarrowRight />
            </div>

            <div className="flex flex-row">
              <Listbox
                value={proEntitlementNew}
                onChange={setProEntitlementNew}
              >
                {({ open }) => {
                  return (
                    <div className="relative">
                      <Listbox.Button
                        className="relative w-full cursor-default border
                  py-1.5 px-4 text-left shadow-sm sm:text-sm rounded-lg
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
                        rounded-lg border max-h-[200px] overflow-auto"
                        >
                          {Array.apply(null, Array(entitlements + 1)).map(
                            (_, i) => {
                              console.log(i)
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
          <Text size="sm" weight="medium" className="text-gray-800 text-left">
            Changes to your subscription
          </Text>

          <div className="flex flex-row gap-2 items-center">
            <Text size="lg" weight="semibold" className="text-gray-900">{`-$${
              plan.price * (entitlements - proEntitlementNew)
            }`}</Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              per month
            </Text>
          </div>
        </div>
      </section>
      <section className="flex flex-row-reverse gap-4 mt-auto m-5">
        <Button
          btnType="dangerous-alt"
          disabled={!paymentData?.paymentMethodID}
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
          Remove Entitelment(s)
        </Button>
        <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </section>
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
    <Modal isOpen={isOpen} fixed handleClose={() => setIsOpen(false)}>
      <Text
        size="lg"
        weight="semibold"
        className="text-left text-gray-800 mx-5 mb-7"
      >
        Assigned Application(s)
      </Text>

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

              <NavLink to={`/apps/${app.clientId}/gnillib`}>
                <Button btnType="secondary-alt">Manage</Button>
              </NavLink>
            </li>
          ))}
        </ul>
      </section>
    </Modal>
  )
}

const PlanCard = ({
  plan,
  entitlements,
  apps,
  paymentData,
  submit,
}: {
  plan: PlanDetails
  entitlements: number
  apps: AppLoaderData[]
  paymentData?: PaymentData
  submit: (data: any, options: any) => void
}) => {
  const [purchaseProModalOpen, setPurchaseProModalOpen] = useState(false)
  const [removeEntitlementModalOpen, setRemoveEntitlementModalOpen] =
    useState(false)
  const [assignedAppModalOpen, setAssignedAppModalOpen] = useState(false)
  return (
    <>
      <PurchaseProModal
        isOpen={purchaseProModalOpen}
        setIsOpen={setPurchaseProModalOpen}
        plan={plan}
        entitlements={entitlements}
        paymentData={paymentData}
        submit={submit}
      />
      <RemoveEntitelmentModal
        isOpen={removeEntitlementModalOpen}
        setIsOpen={setRemoveEntitlementModalOpen}
        plan={plan}
        entitlements={entitlements}
        entitlementUsage={apps.length}
        paymentData={paymentData}
        submit={submit}
      />
      <AssignedAppModal
        isOpen={assignedAppModalOpen}
        setIsOpen={setAssignedAppModalOpen}
        apps={apps}
      />
      <article className="bg-white rounded border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
          <div>
            <Text size="lg" weight="semibold" className="text-gray-900">
              {plan.title}
            </Text>
            <Text size="sm" weight="medium" className="text-[#6B7280]">
              {plan.description}
            </Text>
          </div>

          <Menu>
            {({ open }) => (
              <>
                <Menu.Button
                  className={`py-2 px-3 border rounded flex flex-row justify-between lg:justify-start gap-2 items-center ${
                    open ? 'border-indigo-500' : ''
                  } disabled:bg-gray-50 text-gray-700 disabled:text-gray-400`}
                  disabled={paymentData == undefined}
                >
                  <Text size="sm" weight="medium">
                    Edit
                  </Text>
                  {open ? (
                    <ChevronUpIcon className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-indigo-500" />
                  )}
                </Menu.Button>

                <Menu.Items className="absolute right-4 top-16 bg-white rounded-lg border shadow">
                  <Menu.Item>
                    <button
                      type="button"
                      className="flex flex-row items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
                      onClick={() => {
                        setPurchaseProModalOpen(true)
                      }}
                    >
                      <FaShoppingCart className="text-gray-500" />

                      <Text size="sm" weight="medium" className="text-gray-700">
                        Purchase Entitlement(s)
                      </Text>
                    </button>
                  </Menu.Item>

                  <div className="border-b border-gray-200 w-3/4 mx-auto"></div>

                  <Menu.Item disabled={entitlements === 0}>
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveEntitlementModalOpen(true)
                      }}
                      className={classnames(
                        'flex flex-row items-center gap-3 py-3 px-4 rounded-b-lg',
                        entitlements !== 0
                          ? 'cursor-pointer hover:bg-gray-50 text-red-600'
                          : 'cursor-default text-red-300'
                      )}
                    >
                      <HiOutlineMinusCircle />

                      <Text size="sm" weight="medium">
                        Remove Entitlement(s)
                      </Text>
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </>
            )}
          </Menu>
        </header>
        <div className="w-full border-b border-gray-200"></div>
        <main>
          <div className="flex flex-row gap-7 p-4">
            <PlanFeatures plan={plan} />
          </div>

          <div className="border-b border-gray-200"></div>

          {apps.length > 0 && (
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
                        width: `${(apps.length / entitlements) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      <button
                        type="button"
                        className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b disabled:text-indigo-300"
                        onClick={() => {
                          setAssignedAppModalOpen(true)
                        }}
                      >
                        <Text size="sm" weight="medium">
                          View Assigned Apps
                        </Text>
                      </button>
                    </div>
                    <Text size="sm" weight="medium" className="text-[#6B7280]">
                      {`${apps.length} out of ${entitlements} Entitlements used`}
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
            <div className="bg-gray-50 rounded-b py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b disabled:text-indigo-300"
                onClick={() => {
                  setPurchaseProModalOpen(true)
                }}
              >
                <FaShoppingCart className="w-3.5 h-3.5" />
                <Text size="sm" weight="medium">
                  Purchase Entitlement(s)
                </Text>
              </button>
            </div>
          )}
          {entitlements > apps.length && (
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b py-4 px-6">
              <button
                disabled={paymentData == undefined}
                type="button"
                className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b disabled:text-indigo-300"
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
  const { entitlements, successToast, paymentData, connectedEmails, invoices } =
    useLoaderData<LoaderData>()

  const { apps, PASSPORT_URL } = useOutletContext<OutletContextData>()

  useEffect(() => {
    if (successToast) {
      toast(ToastType.Success, {
        message: successToast,
      })
    }
  }, [successToast])

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
  const [selectedEmailURN, setSelectedEmailURN] = useState<string | undefined>()
  const [fullName, setFullName] = useState<string | undefined>(
    paymentData?.name
  )

  const submit = useSubmit()
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
        {paymentData && !paymentData.paymentMethodID && (
          <article className="mb-3.5">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/gnillib/payment`}
              linkText="Update payment information"
            />
          </article>
        )}

        {!paymentData && (
          <article className="mb-3.5">
            <ToastInfo message="Please fill Billing Contact Section" />
          </article>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <article className="bg-white rounded border">
          <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
            <div>
              <div className="flex flex-row gap-4 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">
                  Billing Contact
                </Text>

                {!paymentData && <DangerPill text="Not Configured" />}
              </div>
              <Text size="sm" weight="medium" className="text-[#6B7280]">
                This will be used to create a customer ID and for notifications
                about your billing
              </Text>
            </div>

            <Button
              btnType="primary-alt"
              btnSize="sm"
              disabled={!fullName || !selectedEmail}
              onClick={() => {
                submit(
                  {
                    payload: JSON.stringify({
                      name: fullName,
                      email: selectedEmail,
                      emailURN: selectedEmailURN,
                    }),
                  },
                  {
                    action: '/gnillib/details',
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
                        (ce) => ce.title === paymentData?.email
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
          apps={apps.filter((a) => a.appPlan === ServicePlanType.PRO)}
        />
      </section>

      <section className="mt-10">
        <article className="">
          <header className="flex flex-col lg:flex-row justify-between lg:items-center relative mb-6">
            <Text size="lg" weight="semibold" className="text-gray-900">
              Invoices & Payments
            </Text>

            <Link to="/gnillib/portal">
              <Button
                btnType="secondary-alt"
                className="flex flex-row items-center gap-2"
              >
                <HiOutlineCreditCard />
                Update payment information
              </Button>
            </Link>
          </header>

          <main className="flex flex-row gap-4 items-center border rounded-lg">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50 rounded-t-lg">
                <tr className="rounded-t-lg">
                  <th className="px-6 py-3 text-left rounded-tl-lg">
                    <button
                      className="flex flex-row gap-2"
                      onClick={() => {
                        setInvoiceSort(invoiceSort === 'desc' ? 'asc' : 'desc')
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
                  .map((invoice) => (
                    <tr className="border-b border-gray-200">
                      <td className="px-6 py-3">
                        {hydrated && (
                          <Text size="sm" className="gray-500">
                            {new Date(invoice.timestamp).toLocaleString(
                              'default',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </Text>
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
                          <a href={invoice.url} target="_blank">
                            <Text size="xs" className="text-indigo-500">
                              View Invoice
                            </Text>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </main>
        </article>
      </section>
    </>
  )
}
