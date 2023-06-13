import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction } from '@remix-run/cloudflare'
import { FaCheck, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { requireJWT } from '~/utilities/session.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import type { LoaderData as OutletContextData } from '~/root'
import { Menu } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { HiOutlineMinusCircle } from 'react-icons/hi'

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

const PlanFeatures = ({
  features,
  colorClass,
}: {
  features: string[]
  colorClass: string
}) => {
  return (
    <ul className="flex flex-col gap-3.5">
      {features.map((feature) => (
        <li key={feature} className="flex flex-row items-center gap-3">
          <FaCheck className={colorClass} />
          <Text size="sm" weight="medium" className="text-[#6B7280]">
            {feature}
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

    const proApps = reshapedApps.slice(0, 2)
    let freeApps: any[] = []

    if (reshapedApps.length > 2) {
      freeApps = reshapedApps.slice(2)
    }

    const entitlements = {
      pro: proApps.map((pa) => pa.clientId),
      free: freeApps.map((fa) => fa.clientId),
    }

    return {
      entitlements,
    }
  }
)

export default () => {
  const { entitlements } = useLoaderData()
  const { apps } = useOutletContext<OutletContextData>()

  return (
    <>
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
          <Button btnType="secondary-alt" btnSize="sm">
            <div className="flex flex-row items-center gap-3">
              <Text size="sm" weight="medium" className="text-gray-700">
                Compare plans
              </Text>

              <HiOutlineExternalLink className="text-gray-500" />
            </div>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <PlanCard
          title="Pro Plan"
          subtitle="Everything in free & custom domain configuration, advanced
                support, whitelabeling and much more."
          action={
            entitlements.pro.length === 0 ? (
              <Button btnType="secondary-alt" btnSize="xs">
                <div className="flex flex-row items-center gap-3">
                  <FaShoppingCart className="text-gray-500" />

                  <Text size="sm" weight="medium" className="text-gray-700">
                    Purchase
                  </Text>
                </div>
              </Button>
            ) : (
              <Menu>
                {({ open }) => (
                  <>
                    <Menu.Button
                      className={`py-2 px-3 border rounded flex flex-row gap-2 items-center ${
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
                        <div className="flex flex-row items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-t-lg">
                          <FaShoppingCart className="text-gray-500" />

                          <Text
                            size="sm"
                            weight="medium"
                            className="text-gray-700"
                          >
                            Purchase Entitlement(s)
                          </Text>
                        </div>
                      </Menu.Item>

                      <div className="border-b border-gray-200 w-3/4 mx-auto"></div>

                      <Menu.Item>
                        <div className="flex flex-row items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-b-lg">
                          <HiOutlineMinusCircle className="text-red-600" />

                          <Text
                            size="sm"
                            weight="medium"
                            className="text-red-600"
                          >
                            Remove Entitlement(s)
                          </Text>
                        </div>
                      </Menu.Item>
                    </Menu.Items>
                  </>
                )}
              </Menu>
            )
          }
          main={
            <>
              <div className="flex flex-row gap-7 p-4">
                <PlanFeatures
                  colorClass="text-indigo-500"
                  features={[
                    'Unlimited MAUs',
                    'Custom Branding',
                    'Wallet Login',
                    'Social Logins',
                  ]}
                />

                <PlanFeatures
                  colorClass="text-green-500"
                  features={['Profile API', 'Community Support']}
                />
              </div>

              <div className="border-b border-gray-200"></div>

              {entitlements.pro.length > 0 && (
                <div className="p-4">
                  <Text size="sm" weight="medium" className="text-gray-900">
                    Entitlements
                  </Text>

                  <div className="flex flex-row items-center gap-6">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 my-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${(entitlements.pro.length / 3) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <Text
                        size="lg"
                        weight="semibold"
                        className="text-gray-900"
                      >
                        ${entitlements.pro.length * 29}
                      </Text>
                      <Text size="sm" className="text-gray-500">
                        per month
                      </Text>
                    </div>
                  </div>
                  <Text size="sm" weight="medium" className="text-[#6B7280]">
                    {entitlements.pro.length} out of 3 Entitlements used
                  </Text>
                </div>
              )}
            </>
          }
          footer={
            entitlements.pro.length === 0 ? (
              <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
                <FaShoppingCart /> <Text>Purchase Entitlement(s)</Text>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
                <FaTrash /> <Text>Remove Unused Entitlements</Text>
              </div>
            )
          }
        />

        <PlanCard
          title="Business Plan"
          subtitle="Everything in Pro & ..."
          main={
            <div className="flex flex-row gap-7 p-4">
              <PlanFeatures
                colorClass="text-indigo-500"
                features={[
                  'Unlimited MAUs',
                  'Custom Branding',
                  'Wallet Login',
                  'Social Logins',
                ]}
              />

              <PlanFeatures
                colorClass="text-green-500"
                features={['Profile API', 'Community Support']}
              />
            </div>
          }
        />

        <PlanCard
          title="Enterprise Plan"
          subtitle="Everything in Business & ..."
          main={
            <div className="flex flex-row gap-7 p-4">
              <PlanFeatures
                colorClass="text-indigo-500"
                features={[
                  'Unlimited MAUs',
                  'Custom Branding',
                  'Wallet Login',
                  'Social Logins',
                ]}
              />

              <PlanFeatures
                colorClass="text-green-500"
                features={['Profile API', 'Community Support']}
              />
            </div>
          }
        />

        <EntitlementsCard
          entitlements={apps.map((a) => ({
            title: a.name!,
            subtitle: entitlements.pro.includes(a.clientId)
              ? 'Pro Plan $29/month'
              : 'Free',
          }))}
        />
      </section>
    </>
  )
}
