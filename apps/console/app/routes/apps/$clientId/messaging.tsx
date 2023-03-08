import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import messagingSVG from '~/assets/early/messaging.svg'

export default () => (
  <EarlyAccessPanel
    title="Messaging"
    subtitle="Heading"
    copy="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Aenean vel massa quis mauris vehicula lacinia. Ut tempus purus at lorem. Suspendisse sagittis ultrices augue. Cras elementum. Etiam bibendum elit eget erat."
    imgSrc={messagingSVG}
  />
)
