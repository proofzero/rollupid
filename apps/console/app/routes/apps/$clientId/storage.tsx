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
      subtitle="App Data Storage"
      copy="App Data Storage service provides a hassle-free way to store and retrieve per-user data for your application. Once activated, the service can be accessed through our Galaxy API and it supports storing data up to 128kb, per user."
      imgSrc={storageSVG}
      url={'https://docs.rollup.id/platform/console/storage'}
      earlyAccess={false}
      currentPlan={appDetails.appPlan}
      featurePlan={ServicePlanType.PRO}
      identityURN={identityURN}
    />
  )
}
