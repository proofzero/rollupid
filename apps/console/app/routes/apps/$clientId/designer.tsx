import designerSVG from '~/assets/early/designer.webp'
import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'

export default () => (
  <EarlyAccessPanel
    title="Designer"
    subtitle="Customise your login experience"
    copy="With a white label feature in your authentication tool, you can customize the user interface to match your brand, giving a seamless experience to your users. This not only enhances brand consistency but also establishes trust with users, making it an essential security measure for protecting sensitive data."
    imgSrc={designerSVG}
    imgClassName="w-[363px]"
  />
)
