import { InfoPanelIcon } from './InfoPanelIcon'
import { FaAddressBook } from 'react-icons/fa'

export default {
  title: 'Atoms/Info Panel/Icon',
  component: InfoPanelIcon,
}

const Template = () => (
  <div className="flex">
    <InfoPanelIcon Icon={FaAddressBook} />
  </div>
)

export const Default = Template.bind({})
