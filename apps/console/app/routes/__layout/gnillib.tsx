import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/cloudflare'
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
import { useLoaderData, useOutletContext, useSubmit } from '@remix-run/react'
import type { LoaderData as OutletContextData } from '~/root'
import { Menu } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { HiOutlineMinusCircle } from 'react-icons/hi'
import { IconType } from 'react-icons'
import { TbHourglassHigh } from 'react-icons/tb'
import classnames from 'classnames'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useState } from 'react'
import { ServicePlanType } from '@proofzero/types/account'

const PlanCard = ({
  title,
  subtitle,
  action,
  main,
  footer,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  main?: React.ReactNode
  footer?: React.ReactNode
}) => {
  return (
    <article className="bg-white rounded border">
      <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
        <div>
          <Text size="lg" weight="semibold" className="text-gray-900">
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" weight="medium" className="text-[#6B7280]">
              {subtitle}
            </Text>
          )}
        </div>

        {action}
      </header>
      <div className="w-full border-b border-gray-200"></div>
      <main>{main}</main>
      {footer && (
        <footer className="bg-gray-50 rounded-b py-4 px-6">{footer}</footer>
      )}
    </article>
  )
}

const PlanFeaturesColumnItems = ({
  features,
}: {
  features: {
    title: string
    Icon: IconType
    colorClass?: string
  }[]
}) => (
  <>
    {features.map((feature) => (
      <li
        key={feature.title}
        className={`flex flex-row items-center gap-3 text-[#6B7280]`}
      >
        <div className="w-3.5 h-3.5 flex justify-center items-center">
          <feature.Icon className={`${feature.colorClass ?? ''}`} />
        </div>

        <Text size="sm" weight="medium">
          {feature.title}
        </Text>
      </li>
    ))}
  </>
)

const PlanFeatures = ({
  features,
}: {
  features: {
    title: string
    Icon: IconType
    colorClass?: string
  }[]
}) => {
  const COLUMN_MAX = 4

  const columns = []
  for (let i = 0; i < features.length; i += COLUMN_MAX) {
    columns.push(features.slice(i, i + COLUMN_MAX))
  }

  return (
    <>
      <div className="hidden lg:flex lg:flex-row lg:gap-4">
        {columns.map((columnFeatures, i) => (
          <ul key={i} className="flex flex-col gap-3.5">
            <PlanFeaturesColumnItems features={columnFeatures} />
          </ul>
        ))}
      </div>

      <div className="block lg:hidden">
        <ul className="flex flex-col gap-3.5">
          <PlanFeaturesColumnItems
            features={columns.reduce((acc, curr) => [...acc, ...curr], [])}
          />
        </ul>
      </div>
    </>
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

const PurchaseEntitlementsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: (val: boolean) => void
}) => {
  const [entitlementDelta, setEntitlementDelta] = useState(1)

  const submit = useSubmit()

  return (
    <Modal isOpen={isOpen} fixed handleClose={() => onClose(false)}>
      <Text size="lg" weight="semibold" className="text-left text-gray-800 m-5">
        Purchase Entitlement(s)
      </Text>

      <section className="m-5 border rounded-lg">
        <div className="p-6">
          <Text size="lg" weight="semibold" className="font-gray-900 text-left">
            Pro Plan
          </Text>

          <Text
            size="sm"
            weight="medium"
            className="font-[#6B7280] text-left mb-6"
          >
            Everything in free & custom domain configuration, advanced support,
            whitelabeling and much more.
          </Text>

          <PlanFeatures
            features={[
              {
                title: 'Custom Branding',
                Icon: FaCheck,
                colorClass: 'text-green-500',
              },
              {
                title: 'Custom Domain',
                Icon: FaCheck,
                colorClass: 'text-green-500',
              },
              {
                title: 'Custom OAuth Credentials',
                Icon: FaCheck,
                colorClass: 'text-green-500',
              },
              {
                title: 'Object Storage',
                Icon: TbHourglassHigh,
              },
              {
                title: '4337 App Wallet',
                Icon: TbHourglassHigh,
              },
              {
                title: 'Groups',
                Icon: TbHourglassHigh,
              },
            ]}
          />
        </div>

        <div className="border-b border-gray-200"></div>

        <div className="p-6 flex justify-between items-center">
          <div>
            <Text size="sm" weight="medium" className="font-gray-800 text-left">
              Number of Entitlements
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="font-[#6B7280] text-left"
            >
              {entitlementDelta} x $29/month
            </Text>
          </div>

          <div className="flex flex-row">
            <button
              type="button"
              className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-l-lg px-4"
              onClick={() => {
                if (entitlementDelta > 1) {
                  setEntitlementDelta((prev) => prev - 1)
                }
              }}
            >
              <HiMinus />
            </button>

            <input
              type="text"
              className="border border-x-0 text-center w-[100px] border-gray-300 focus:ring-0 focus:outline-0 focus:border-gray-300"
              readOnly
              value={entitlementDelta}
            />

            <button
              type="button"
              className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-r-lg px-4"
              onClick={() => {
                setEntitlementDelta((prev) => prev + 1)
              }}
            >
              <HiPlus />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200"></div>

        <div className="p-6 flex justify-between items-center">
          <Text size="sm" weight="medium" className="font-gray-800 text-left">
            Changes to your subscription
          </Text>

          <Text>{`+$${29 * entitlementDelta} per month`}</Text>
        </div>
      </section>

      <div className="flex-1"></div>

      <section className="flex flex-row-reverse gap-4 m-5">
        <Button
          btnType="primary-alt"
          onClick={() => {
            onClose(true)
            submit(
              {
                action: 'purchase',
                payload: JSON.stringify({
                  entitlementsDelta: entitlementDelta,
                }),
              },
              {
                action: '/billing',
                method: 'post',
              }
            )
          }}
        >
          Save
        </Button>
        <Button btnType="secondary-alt" onClick={() => onClose(true)}>
          Cancel
        </Button>
      </section>
    </Modal>
  )
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
    const reshapedApps = apps.map((a) => {
      return {
        clientId: a.clientId,
        name: a.app?.name,
        icon: a.app?.icon,
        published: a.published,
        createdTimestamp: a.createdTimestamp,
      }
    })

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const entitlementz = await accountClient.getEntitlements.query()

    const proAllotance =
      entitlementz.find((e) => e.planType === ServicePlanType.PRO)
        ?.entitlements ?? 0

    const proUsage = Math.min(2, proAllotance)
    const proApps = reshapedApps.slice(0, proUsage)

    let freeApps: any[] = []
    if (reshapedApps.length > proUsage) {
      freeApps = reshapedApps.slice(proUsage)
    }

    const entitlements = {
      pro: {
        allotance: proAllotance,
        assigned: proApps.map((pa) => pa.clientId),
      },
      free: {
        assigned: freeApps.map((fa) => fa.clientId),
      },
    }

    return {
      entitlements,
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const action = fd.get('action')
    switch (action) {
      case 'purchase': {
        const payload: {
          entitlementsDelta: number
        } = JSON.parse(fd.get('payload') as string)

        await accountClient.updateEntitlements.mutate({
          planType: ServicePlanType.PRO,
          delta: payload.entitlementsDelta,
        })

        const flashSession = await getFlashSession(
          request.headers.get('Cookie')
        )
        flashSession.flash('toast', {
          type: 'success',
          message: 'Successfully updated entitlements',
        })

        return redirect('/billing', {
          headers: {
            'Set-Cookie': await commitFlashSession(flashSession),
          },
        })
      }
    }

    return null
  }
)

export default () => {
  const { entitlements } = useLoaderData()
  const { apps } = useOutletContext<OutletContextData>()

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)

  return (
    <>
      <PurchaseEntitlementsModal
        isOpen={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false)
        }}
      />

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
          title="Pro Plan"
          subtitle="Everything in free, custom domain configuration & more."
          action={
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
                          setPurchaseModalOpen(true)
                        }}
                      >
                        <FaShoppingCart className="text-gray-500" />

                        <Text
                          size="sm"
                          weight="medium"
                          className="text-gray-700"
                        >
                          Purchase Entitlement(s)
                        </Text>
                      </button>
                    </Menu.Item>

                    <div className="border-b border-gray-200 w-3/4 mx-auto"></div>

                    <Menu.Item disabled={entitlements.pro.allotance === 0}>
                      <div
                        className={classnames(
                          'flex flex-row items-center gap-3 py-3 px-4 rounded-b-lg',
                          entitlements.pro.allotance !== 0
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
          }
          main={
            <>
              <div className="flex flex-row gap-7 p-4">
                <PlanFeatures
                  features={[
                    {
                      title: 'Custom Branding',
                      Icon: FaCheck,
                      colorClass: 'text-green-500',
                    },
                    {
                      title: 'Custom Domain',
                      Icon: FaCheck,
                      colorClass: 'text-green-500',
                    },
                    {
                      title: 'Custom OAuth Credentials',
                      Icon: FaCheck,
                      colorClass: 'text-green-500',
                    },
                    {
                      title: 'Object Storage',
                      Icon: TbHourglassHigh,
                    },
                    {
                      title: '4337 App Wallet',
                      Icon: TbHourglassHigh,
                    },
                    {
                      title: 'Groups',
                      Icon: TbHourglassHigh,
                    },
                  ]}
                />
              </div>

              <div className="border-b border-gray-200"></div>

              {entitlements.pro.assigned.length > 0 && (
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
                            (entitlements.pro.assigned.length /
                              entitlements.pro.allotance) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <Text
                        size="lg"
                        weight="semibold"
                        className="text-gray-900"
                      >
                        ${entitlements.pro.assigned.length * 29}
                      </Text>
                      <Text size="sm" className="text-gray-500">
                        per month
                      </Text>
                    </div>
                  </div>
                  <Text size="sm" weight="medium" className="text-[#6B7280]">
                    {`${entitlements.pro.assigned.length} out of ${entitlements.pro.allotance} Entitlements used`}
                  </Text>
                </div>
              )}
            </>
          }
          footer={
            entitlements.pro.allotance === 0 ||
            entitlements.pro.assigned.length < entitlements.pro.allotance ? (
              <>
                {entitlements.pro.allotance === 0 && (
                  <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
                    <FaShoppingCart className="w-3.5 h-3.5" />
                    <Text size="sm" weight="medium">
                      Purchase Entitlement(s)
                    </Text>
                  </div>
                )}
                {entitlements.pro.allotance >
                  entitlements.pro.assigned.length && (
                  <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
                    <FaTrash className="w-3.5 h-3.5" />
                    <Text size="sm" weight="medium">
                      Remove Unused Entitlements
                    </Text>
                  </div>
                )}
              </>
            ) : undefined
          }
        />

        <EntitlementsCard
          entitlements={apps.map((a) => ({
            title: a.name!,
            subtitle: entitlements.pro.assigned.includes(a.clientId)
              ? 'Pro Plan $29/month'
              : 'Free',
          }))}
        />
      </section>
    </>
  )
}
