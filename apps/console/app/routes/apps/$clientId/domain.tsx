import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import domainSVG from '~/assets/early/domain.svg'

export default () => (
  <EarlyAccessPanel
    title="Custom Domain"
    subtitle="Configure Custom Domain"
    copy="A custom domain feature in an authentication tool allows an organization to use its own domain name instead of the tool's default domain. This provides a more seamless user experience, improves brand consistency, and enhances the security of the authentication process by reducing the risk of phishing scams."
    imgSrc={domainSVG}
    url={'https://docs.rollup.id/platform/console'}
  />
)
