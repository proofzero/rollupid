import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { FaCheck, FaShoppingCart } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'

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
      <header className="flex flex-row justify-between items-center pt-2.5 pb-4 pl-6 pr-4">
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
      <main className="flex flex-row pt-4 pb-6 pl-6 pr-4 gap-7">{main}</main>
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
      <header className="flex flex-row justify-between items-center pt-2.5 pb-4 pl-6 pr-4">
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
              <div className="flex flex-row justify-between items-center w-full py-2.5 pl-6 pr-4">
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

export default () => {
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
            <Button btnType="secondary-alt" btnSize="xs">
              <div className="flex flex-row items-center gap-3">
                <FaShoppingCart className="text-gray-500" />

                <Text size="sm" weight="medium" className="text-gray-700">
                  Purchase
                </Text>
              </div>
            </Button>
          }
          main={
            <>
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
            </>
          }
          footer={
            <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer">
              <FaShoppingCart /> <Text>Purchase Entitlement(s)</Text>
            </div>
          }
        />

        <PlanCard
          title="Business Plan"
          subtitle="Everything in Pro & ..."
          main={
            <>
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
            </>
          }
        />

        <PlanCard
          title="Enterprise Plan"
          subtitle="Everything in Business & ..."
          main={
            <>
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
            </>
          }
        />

        <EntitlementsCard
          entitlements={[
            {
              title: 'App 1',
              subtitle: 'Pro Plan $29/month',
            },
            {
              title: 'App 2',
              subtitle: 'Pro Plan $29/month',
            },
            {
              title: 'App 3',
              subtitle: 'Free',
            },
          ]}
        />
      </section>
    </>
  )
}
