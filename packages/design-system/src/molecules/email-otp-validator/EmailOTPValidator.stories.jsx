import React from 'react'

import EmailOTPValidator from './EmailOTPValidator'

export default {
  title: 'Molecules/EmailOTPValidator',
  component: EmailOTPValidator,
}

const Template = (args) => (
  <div className="w-[402px] h-[491px]">
    <div className="bg-white rounded-lg p-9 flex flex-col h-full">
      <EmailOTPValidator {...args} />
    </div>
  </div>
)

export const EmailOTPValidatorExample = Template.bind({})
EmailOTPValidatorExample.args = {
  email: 'john@email.com',
  regenerationTimerSeconds: 60,
  goBack: async () => {},
  requestRegeneration: async () => {},
  requestVerification: async () => {
    await new Promise((ok) => setTimeout(ok, 2500))

    return false
  },
}
