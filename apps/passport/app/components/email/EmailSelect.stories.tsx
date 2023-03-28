import { EmailSelect } from './EmailSelect'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

export default {
  title: 'Atoms/Email/Select',
  component: EmailSelect,
}

const listItems = [
  {
    iconURL: googleIcon,
    email: 'email@gmail.com',
  },
  {
    iconURL: microsoftIcon,
    email: 'email@msft.com',
  },
]

const Template = (args: any) => (
  <div className="w-[262px]">
    <EmailSelect items={listItems} {...args} />
  </div>
)

export const EmailSelectExample = Template.bind({}) as any
EmailSelectExample.args = {
  enableAddNew: true,
}
