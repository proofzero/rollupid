import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import audienceSVG from '~/assets/early/audience.svg'
import { useOutletContext } from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { IdentityURN } from '@proofzero/urns/identity'

export default () => {
  const { appDetails, identityURN } = useOutletContext<{
    appDetails: appDetailsProps
    identityURN: IdentityURN
  }>()

  return (
    <EarlyAccessPanel
      clientID={appDetails.clientId as string}
      title="Audience Builder"
      subtitle="Direct User Acquisition"
      copy="With the zero-knowledge audience builder tool, businesses can identify and target specific groups of potential users, creating personalized marketing messages that optimize user acquisition efforts. This feature enables businesses to launch their application and acquire their first and next users efficiently and effectively, ensuring a successful launch."
      imgSrc={audienceSVG}
      url={'https://docs.rollup.id/platform/console/audience-builder'}
      earlyAccess={true}
      currentPlan={appDetails.appPlan}
      identityURN={identityURN}
    />
  )
}
