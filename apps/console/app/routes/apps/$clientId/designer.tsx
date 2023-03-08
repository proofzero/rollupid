import designerSVG from '~/assets/early/designer.svg'
import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'

const AppDesignerPage = () => (
  <EarlyAccessPanel
    title="Designer"
    subtitle="Customise your login experience"
    copy="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Aenean vel massa quis mauris vehicula lacinia. Ut tempus purus at lorem. Suspendisse sagittis ultrices augue. Cras elementum. Etiam bibendum elit eget erat."
    imgSrc={designerSVG}
  />
)

export default AppDesignerPage
