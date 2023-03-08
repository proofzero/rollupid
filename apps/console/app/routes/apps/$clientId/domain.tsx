import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import domainSVG from '~/assets/early/domain.svg'

export default () => (
  <EarlyAccessPanel
    title="Custom Domain"
    subtitle="Configure Custom Domain"
    copy="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Aenean vel massa quis mauris vehicula lacinia. Ut tempus purus at lorem. Suspendisse sagittis ultrices augue. Cras elementum. Etiam bibendum elit eget erat."
    imgSrc={domainSVG}
  />
)
