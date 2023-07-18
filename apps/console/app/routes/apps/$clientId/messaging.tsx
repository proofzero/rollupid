import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import messagingSVG from '~/assets/early/messaging.svg'
import { useOutletContext } from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { AccountURN } from '@proofzero/urns/account'

export default () => {
  const { appDetails, accountURN } = useOutletContext<{
    appDetails: appDetailsProps
    accountURN: AccountURN
  }>()

  return (
    <EarlyAccessPanel
      clientID={appDetails.clientId as string}
      title="Messaging"
      subtitle="Communicate directly to users"
      copy="A messaging tool inside a CRM allows businesses to communicate with their users and prospects from a single platform, providing a more efficient and streamlined process. It enables automation, personalized communication, and improved user engagement, resulting in stronger relationships and increased productivity."
      imgSrc={messagingSVG}
      url={'https://docs.rollup.id/platform/console/messaging'}
      earlyAccess={true}
      currentPlan={appDetails.appPlan}
      accountURN={accountURN}
    />
  )
}
