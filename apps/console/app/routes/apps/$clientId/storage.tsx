import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import storageSVG from '~/assets/early/storage.svg'
import { useOutletContext } from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { IdentityURN } from '@proofzero/urns/identity'
import { ServicePlanType } from '@proofzero/types/billing'

export default () => {
  const { appDetails, identityURN } = useOutletContext<{
    appDetails: appDetailsProps
    identityURN: IdentityURN
  }>()

  return (
    <EarlyAccessPanel
      clientID={appDetails.clientId as string}
      title="Storage"
      subtitle="Storage"
      copy="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam rhoncus aliquam metus. Sed elit dui, pellentesque a, faucibus vel, interdum nec, diam. Etiam ligula pede, sagittis quis, interdum ultricies, scelerisque eu. Pellentesque ipsum. Etiam bibendum elit eget erat."
      imgSrc={storageSVG}
      url={'https://docs.rollup.id/platform/console/storage'}
      earlyAccess={false}
      currentPlan={appDetails.appPlan}
      featurePlan={ServicePlanType.PRO}
      identityURN={identityURN}
    />
  )
}
