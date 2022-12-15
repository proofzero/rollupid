import { ApplicationAuth } from './ApplicationAuth'

export default {
  title: 'Pages/Applications/Auth',
  component: ApplicationAuth,
}

const Template = () => (
  <ApplicationAuth
    oAuth={{
      appId: 'APP_ID',
      appSecret: 'APP_SECRET',
      createdAt: new Date(),
      onKeyRoll: () => {},
    }}
  />
)

export const Default = Template.bind({})
