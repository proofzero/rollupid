import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import messagingSVG from '~/assets/early/messaging.svg'

export default () => (
  <EarlyAccessPanel
    title="Messaging"
    subtitle="Communicate directly to users"
    copy="A messaging tool inside a CRM allows businesses to communicate with their users and prospects from a single platform, providing a more efficient and streamlined process. It enables automation, personalized communication, and improved user engagement, resulting in stronger relationships and increased productivity."
    imgSrc={messagingSVG}
    url={'https://docs.rollup.id/platform/console/messaging'}
  />
)
