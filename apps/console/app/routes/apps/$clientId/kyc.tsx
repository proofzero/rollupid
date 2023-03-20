import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import kycSVG from '~/assets/early/kyc.svg'

export default () => (
  <EarlyAccessPanel
    title="Know Your Customer"
    subtitle="Fast KYC"
    copy="The KYC feature enables fast and secure user onboarding by streamlining the identity verification process. It helps businesses comply with regulations related to fraud prevention and anti-money laundering, ensuring a safer environment for both the organization and its customers. KYC is an essential feature for businesses looking to onboard users quickly and efficiently while maintaining compliance with regulations."
    imgSrc={kycSVG}
    url={'https://docs.rollup.id/platform/console/kyc'}
  />
)
