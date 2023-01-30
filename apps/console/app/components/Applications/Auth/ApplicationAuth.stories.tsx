import { SCOPES } from '@kubelt/security/scopes'
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
    onDelete={() => {}}
    scopeMeta={SCOPES}
    appDetails={{
      app: {
        name: 'Foo',
        scopes: [],
      },
      published: true,
    }}
  />
)

export const Default = Template.bind({})
