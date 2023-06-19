import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { FaCheck, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { HiMinus, HiOutlineExternalLink, HiPlus } from 'react-icons/hi'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  useLoaderData,
  useOutletContext,
  useRevalidator,
  useSubmit,
} from '@remix-run/react'
import type { LoaderData as OutletContextData } from '~/root'
import { Menu } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { HiOutlineMinusCircle } from 'react-icons/hi'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import { ServicePlanType } from '@proofzero/types/account'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'

import plans, { PlanDetails } from './plans'

type EntitlementDetails = {
  alloted: number
  pending: number
  allotedClientIds: string[]
}

type LoaderData = {
  customerID?: string
  entitlements: {
    [ServicePlanType.PRO]: EntitlementDetails
    FREE: {
      appClientIds: string[]
    }
  }
  billingToast?: string
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
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

    const { customerID, plans } = await accountClient.getEntitlements.query()

    const proAllotedEntitlements =
      plans?.[ServicePlanType.PRO]?.entitlements ?? 0
    const proPendingEntitlements =
      plans?.[ServicePlanType.PRO]?.pendingEntitlements ?? 0

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
    const billingToast = flashSession.get('billing_toast')

    return json<LoaderData>(
      {
        customerID,
        entitlements: {
          [ServicePlanType.PRO]: {
            alloted: proAllotedEntitlements,
            pending: proPendingEntitlements,
            allotedClientIds: proAppClientIds,
          },
          FREE: {
            appClientIds: freeAppClientIds,
          },
        },
        billingToast,
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
}: {
  plan: PlanDetails
  entitlements: EntitlementDetails
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
            onClick={() => {
              setPurchaseProModalOpen(false)
              setProEntitlementDelta(1)

              submit(
                {
                  payload: JSON.stringify({
                    planType: ServicePlanType.PRO,
                    quantity: proEntitlementDelta,
                    customerID,
                  }),
                },
                {
                  action: '/gnillib/checkout',
                  method: 'post',
                }
              )
            }}
          >
            Save
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
                  }`}
                >
                  <Text size="sm" weight="medium" className="text-gray-700">
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

          {(entitlements.allotedClientIds.length > 0 ||
            entitlements.pending > 0) && (
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
                    ${entitlements.allotedClientIds.length * plans.PRO.price}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    per month
                  </Text>
                </div>
              </div>
              <Text size="sm" weight="medium" className="text-[#6B7280]">
                {`${entitlements.allotedClientIds.length} out of ${
                  entitlements.alloted
                } Entitlements used ${
                  entitlements.pending !== 0
                    ? `(${entitlements.pending} pending)`
                    : ''
                }`}
              </Text>
            </div>
          )}
        </main>
        <footer>
          {entitlements.alloted === 0 && entitlements.pending === 0 && (
            <div
              className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b py-4 px-6"
              onClick={() => {
                setPurchaseProModalOpen(true)
              }}
            >
              <FaShoppingCart className="w-3.5 h-3.5" />
              <Text size="sm" weight="medium">
                Purchase Entitlement(s)
              </Text>
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
  const { entitlements, billingToast, customerID } = useLoaderData<LoaderData>()

  const { apps } = useOutletContext<OutletContextData>()

  const [prevProPendingEntitlements, setPrevProPendingEntitlements] = useState<
    number | undefined
  >(undefined)

  const revalidator = useRevalidator()
  useEffect(() => {
    if (!prevProPendingEntitlements) {
      setPrevProPendingEntitlements(entitlements[ServicePlanType.PRO].pending)
    } else if (
      prevProPendingEntitlements !== 0 &&
      entitlements[ServicePlanType.PRO].pending === 0
    ) {
      toast(ToastType.Success, {
        message: 'Successfully purchased entitlements',
      })
      setPrevProPendingEntitlements(undefined)
    }

    if (entitlements[ServicePlanType.PRO].pending > 0) {
      setTimeout(() => {
        revalidator.revalidate()
      }, 1000)
    }
  }, [entitlements])

  useEffect(() => {
    if (billingToast) {
      toast(ToastType.Info, {
        message: billingToast,
      })
    }
  }, [billingToast])

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

        <div className="flex flex-row justify-end items-center gap-2 mt-2 lg:mt-0">
          <a href="https://rollup.id/pricing" target="_blank">
            <Button btnType="secondary-alt" btnSize="sm">
              <div className="flex flex-row items-center gap-3">
                <Text size="sm" weight="medium" className="text-gray-700">
                  Compare plans
                </Text>
                <HiOutlineExternalLink className="text-gray-500" />
              </div>
            </Button>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PlanCard
          plan={plans[ServicePlanType.PRO]}
          entitlements={entitlements[ServicePlanType.PRO]}
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
