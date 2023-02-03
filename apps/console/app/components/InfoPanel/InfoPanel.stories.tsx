import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'
import { FaAddressBook, FaDiscord, FaTwitter } from 'react-icons/fa'
import { InfoPanel } from './InfoPanel'

export default {
  title: 'Molecules/Info Panel/Panel',
  component: InfoPanel,
}

const links = [
  <ButtonAnchor key="twitter" href="https://twitter.com/threeid_xyz">
    <FaTwitter style={{ color: '#1D9BF0' }} />

    <span>Twitter</span>
  </ButtonAnchor>,
  <ButtonAnchor key="discord" href="https://discord.gg/threeid">
    <FaDiscord style={{ color: '#1D9BF0' }} />

    <span>Discord</span>
  </ButtonAnchor>,
]

const Template = () => (
  <div className="flex">
    <InfoPanel
      heading="Join our community"
      subheading="Doloribus dolores nostrum quia qui natus officia quod et dolorem."
      Icon={FaAddressBook}
      links={links}
    />
  </div>
)

export const Default = Template.bind({})
