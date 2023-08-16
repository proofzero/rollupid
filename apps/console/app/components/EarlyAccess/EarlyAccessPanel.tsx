import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { FeaturePill } from '@proofzero/design-system/src/atoms/pills/FeaturePill'
import { DocumentationBadge } from '../DocumentationBadge'
import type { IdentityURN } from '@proofzero/urns/identity'
import ContactUs from '../ContactUs'
import { ServicePlanType } from '@proofzero/types/billing'
import { isPlanGuarded } from '~/utils/planGate'
import plans from '~/routes/__layout/billing/plans'
import _ from 'lodash'
import { TbLock } from 'react-icons/tb'
import { Button } from '@proofzero/design-system'
import { NavLink } from '@remix-run/react'

type EarlyAccessPanelProps = {
  clientID: string
  title: string
  subtitle: string
  copy: string
  imgSrc: string
  url: string
  imgClassName?: string
  currentPlan: ServicePlanType
  featurePlan?: ServicePlanType
  identityURN: IdentityURN
  earlyAccess: boolean
}

const EarlyAccessPanel = ({
  clientID,
  title,
  subtitle,
  copy,
  imgSrc,
  url,
  imgClassName,
  currentPlan,
  featurePlan,
  identityURN,
  earlyAccess,
}: EarlyAccessPanelProps) => {
  return (
    <>
      <div className="flex flex-row items-center space-x-3 pb-5">
        <Text
          size="2xl"
          weight="semibold"
          className="text-gray-900 ml-2 lg:ml-0 "
        >
          {title}
        </Text>
        <DocumentationBadge url={url} />
      </div>

      <div className="bg-white p-10 rounded-lg shadow flex flex-col lg:flex-row lg:space-x-28 space-y-4 lg:space-y-0">
        <section className="flex-1">
          <div className="mb-4 flex flex-row items-center gap-2">
            {featurePlan && (
              <FeaturePill
                Icon={TbLock}
                text={`${_.toUpper(
                  plans[featurePlan].title.split(' ')[0]
                )} feature`}
              />
            )}
            {earlyAccess && <FeaturePill text="Early Access" />}
          </div>
          <Text size="2xl" weight="semibold" className="text-gray-900 mb-2">
            {subtitle}
          </Text>
          <Text weight="normal" className="text-gray-500">
            {copy}
          </Text>
          <div className="w-full border-t border-gray-200 mt-8 mb-4" />

          {featurePlan && isPlanGuarded(currentPlan, featurePlan) && (
            <NavLink to={`/apps/${clientID}/billing`}>
              <Button btnType="primary-alt" className="mb-4">
                Upgrade Plan
              </Button>
            </NavLink>
          )}

          <ContactUs
            urn={identityURN}
            type={
              featurePlan
                ? isPlanGuarded(currentPlan, featurePlan)
                  ? 'text'
                  : 'btn'
                : 'btn'
            }
          />
        </section>

        <section className="hidden lg:block">
          <img src={imgSrc} className={imgClassName ?? ''} />
        </section>
      </div>
    </>
  )
}

export default EarlyAccessPanel
