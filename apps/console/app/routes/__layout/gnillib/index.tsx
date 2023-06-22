import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/cloudflare'
import { FaCheck, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { HiMinus, HiOutlineMail, HiPlus } from 'react-icons/hi'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAccountClient from '@proofzero/platform-clients/account'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { useLoaderData, useOutletContext, useSubmit } from '@remix-run/react'
import type { LoaderData as OutletContextData } from '~/root'
import { Menu } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { HiOutlineMinusCircle } from 'react-icons/hi'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import { PaymentData, ServicePlanType } from '@proofzero/types/account'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'
import plans, { PlanDetails } from './plans'
import { AccountURN } from '@proofzero/urns/account'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import {
  getEmailDropdownItems,
  getEmailIcon,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import {
  Dropdown,
  DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { ToastInfo } from '@proofzero/design-system/src/atoms/toast/ToastInfo'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'

type EntitlementDetails = {
  alloted: number
  allotedClientIds: string[]
}

type LoaderData = {
  paymentData?: PaymentData
  entitlements: {
    [ServicePlanType.PRO]: EntitlementDetails
    FREE: {
      appClientIds: string[]
    }
  }
  billingSuccess?: string
  connectedEmails: DropdownSelectListItem[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const apps = await starbaseClient.listApps.query()
    const appClientIds = apps.map((a) => a.clientId)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { plans } = await accountClient.getEntitlements.query()

    const proAllotedEntitlements =
      plans?.[ServicePlanType.PRO]?.entitlements ?? 0

    // Capping this to 2 for demo purposes
    const proUsage = Math.min(2, proAllotedEntitlements)
    // Setting first two apps to pro for demo purposes
    const proAppClientIds = appClientIds.slice(0, proUsage)

    // Rest become free apps for demo purposes...
    let freeAppClientIds: any[] = []
    if (appClientIds.length > proUsage) {
      freeAppClientIds = appClientIds.slice(proUsage)
    }

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    const billingSuccess = flashSession.get('billing_success')

    const connectedAccounts = await accountClient.getAddresses.query({
      account: accountURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    const spd = await accountClient.getStripePaymentData.query({
      accountURN,
    })

    return json<LoaderData>(
      {
        paymentData: spd,
        entitlements: {
          [ServicePlanType.PRO]: {
            alloted: proAllotedEntitlements,
            allotedClientIds: proAppClientIds,
          },
          FREE: {
            appClientIds: freeAppClientIds,
          },
        },
        billingSuccess,
        connectedEmails,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession),
        },
      }
    )
  }
)

const PlanFeatures = ({ plan }: { plan: PlanDetails }) => {
  return (
    <ul className="grid lg:grid-rows-4 grid-flow-row lg:grid-flow-col gap-4">
      {plan.features.map((feature) => (
        <li
          key={feature.title}
          className={`flex flex-row items-center gap-3 text-[#6B7280]`}
        >
          <div className="w-3.5 h-3.5 flex justify-center items-center">
            {feature.type === 'base' && (
              <FaCheck className={`text-green-500`} />
            )}
            {feature.type === 'addon' && (
              <FaCheck className={`text-indigo-500`} />
            )}
            {feature.type === 'future' && <TbHourglassHigh />}
          </div>

          <Text size="sm" weight="medium">
            {feature.title}
          </Text>
        </li>
      ))}
    </ul>
  )
}

const EntitlementsCard = ({
  entitlements,
}: {
  entitlements: {
    title: string
    subtitle: string
  }[]
}) => {
  return (
    <article className="bg-white rounded border">
      <header className="flex flex-row justify-between items-center p-4">
        <div>
          <Text size="lg" weight="semibold" className="text-gray-900">
            Assigned Entitlements
          </Text>
        </div>
      </header>
      <div className="w-full border-b border-gray-200"></div>
      <main>
        <div className="w-full">
          {entitlements.map((entitlement, i) => (
            <div key={entitlement.title}>
              <div className="flex flex-row justify-between items-center w-full p-4">
                <div className="flex-1">
                  <Text size="sm" weight="medium" className="text-gray-900">
                    {entitlement.title}
                  </Text>
                  <Text size="sm" weight="medium" className="text-gray-500">
                    {entitlement.subtitle}
                  </Text>
                </div>

                <Button btnType="secondary-alt" btnSize="xs">
                  Manage
                </Button>
              </div>
              {i < entitlements.length - 1 && (
                <div className="w-full border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </main>
    </article>
  )
}

const PlanCard = ({
  plan,
  entitlements,
  paymentData,
}: {
  plan: PlanDetails
  entitlements: EntitlementDetails
  paymentData?: PaymentData
}) => {
  const [purchaseProModalOpen, setPurchaseProModalOpen] = useState(false)
  const [proEntitlementDelta, setProEntitlementDelta] = useState(1)

  const submit = useSubmit()

  return (
    <>
      <Modal
        isOpen={purchaseProModalOpen}
        fixed
        handleClose={() => setPurchaseProModalOpen(false)}
      >
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
              className="text-[#6B7280] text-left mb-6"
            >
              {plan.description}
            </Text>

            <PlanFeatures plan={plan} />
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
                className="text-[#6B7280] text-left"
              >
                {proEntitlementDelta} x ${plan.price}/month
              </Text>
            </div>

            <div className="flex flex-row">
              <button
                type="button"
                className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-l-lg px-4"
                onClick={() => {
                  if (proEntitlementDelta > 1) {
                    setProEntitlementDelta((prev) => prev - 1)
                  }
                }}
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

        <section className="flex flex-row-reverse gap-4 m-5">
          <Button
            btnType="primary-alt"
            disabled={!paymentData?.paymentMethodID}
            onClick={() => {
              setPurchaseProModalOpen(false)
              setProEntitlementDelta(1)

              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: entitlements.alloted + proEntitlementDelta,
                    customerID: paymentData?.customerID,
                  }),
                },
                {
                  action: '/gnillib/checkout',
                  method: 'post',
                }
              )
            }}
          >
            Checkout
          </Button>
          <Button
            btnType="secondary-alt"
            onClick={() => setPurchaseProModalOpen(false)}
          >
            Cancel
          </Button>
        </section>
      </Modal>
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

                  <Menu.Item disabled={entitlements.alloted === 0}>
                    <div
                      className={classnames(
                        'flex flex-row items-center gap-3 py-3 px-4 rounded-b-lg',
                        entitlements.alloted !== 0
                          ? 'cursor-pointer hover:bg-gray-50 text-red-600'
                          : 'cursor-default text-red-300'
                      )}
                    >
                      <HiOutlineMinusCircle />

                      <Text size="sm" weight="medium">
                        Remove Entitlement(s)
                      </Text>
                    </div>
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

          {entitlements.allotedClientIds.length > 0 && (
            <div className="p-4">
              <Text size="sm" weight="medium" className="text-gray-900">
                Entitlements
              </Text>

              <div className="flex flex-row items-center gap-6">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 my-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (entitlements.allotedClientIds.length /
                          entitlements.alloted) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Text size="lg" weight="semibold" className="text-gray-900">
                    ${entitlements.alloted * plans.PRO.price}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    per month
                  </Text>
                </div>
              </div>
              <Text size="sm" weight="medium" className="text-[#6B7280]">
                {`${entitlements.allotedClientIds.length} out of ${entitlements.alloted} Entitlements used`}
              </Text>
            </div>
          )}
        </main>
        <footer>
          {entitlements.alloted === 0 && (
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
          {entitlements.alloted > entitlements.allotedClientIds.length && (
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b py-4 px-6">
              <FaTrash className="w-3.5 h-3.5" />
              <Text size="sm" weight="medium">
                Remove Unused Entitlements
              </Text>
            </div>
          )}
        </footer>
      </article>
    </>
  )
}

export default () => {
  const { entitlements, billingSuccess, paymentData, connectedEmails } =
    useLoaderData<LoaderData>()

  const { apps, PASSPORT_URL } = useOutletContext<OutletContextData>()

  useEffect(() => {
    if (billingSuccess) {
      toast(ToastType.Success, {
        message: billingSuccess,
      })
    }
  }, [billingSuccess])

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

        {/* <div className="flex flex-row justify-end items-center gap-2 mt-2 lg:mt-0">
          <Button
            btnType="secondary-alt"
            btnSize="sm"
            onClick={() => {
              submit(
                {},
                {
                  action: '/gnillib/payment',
                  method: 'post',
                }
              )
            }}
          >
            Updated payment methods
          </Button>

          <Button
            btnType="secondary-alt"
            btnSize="sm"
            onClick={() => {
              submit(
                {
                  payload: JSON.stringify({
                    customerID: customerID as string,
                    quantity: 7,
                  }),
                },
                {
                  action: '/gnillib',
                  method: 'post',
                }
              )
            }}
          >
            Get new sub
          </Button>
        </div> */}
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
                This will be used to create a custumer ID and for notifications
                about your billing
              </Text>
            </div>

            <Button
              btnType="primary-alt"
              btnSize="sm"
              disabled={!fullName || !selectedEmail || paymentData != undefined}
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
          <main className="p-4 flex flex-row gap-4 items-center">
            <div className="w-52">
              <Input
                id="full_name"
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                }}
                disabled={paymentData != undefined}
              />
            </div>

            <div className="self-start w-80">
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
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-700 mb-2"
                  >
                    <sup>*</sup>
                    Email
                  </Text>

                  <Dropdown
                    disabled={paymentData != undefined}
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
        />

        <EntitlementsCard
          entitlements={apps.map((a) => ({
            title: a.name!,
            subtitle: entitlements[
              ServicePlanType.PRO
            ].allotedClientIds.includes(a.clientId)
              ? `Pro Plan ${plans.PRO.price}/month`
              : 'Free',
          }))}
        />
      </section>
    </>
  )
}
