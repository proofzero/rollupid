import { ApplicationDashboard } from './ApplicationDashboard'

export default {
  title: 'Pages/Applications/Dashboard',
  component: ApplicationDashboard,
}

const Template = () => (
  <ApplicationDashboard
    fetcherState={{ type: 'done', state: 'idle' }}
    CTAprops={{ clickHandler: () => {}, CTAneeded: false }}
    authorizedProfiles={[
      { name: 'Eve', timestamp: new Date(2023, 0).getTime(), accountURN: '' },
      {
        name: 'Bob',
        timestamp: new Date(2023, 0).getTime() + 1000,
        accountURN: '',
      },
      {
        name: 'Sam',
        timestamp: new Date(2023, 0).getTime() + 2000,
        accountURN: '',
      },
    ]}
    galaxyGql={{
      apiKey: 'API_KEY',
      createdAt: new Date(2023, 0),
      onKeyRoll: () => {},
    }}
    oAuth={{
      appId: 'APP_ID',
      appSecret: 'APP_SECRET',
      createdAt: new Date(2023, 0),
      onKeyRoll: () => {},
    }}
  />
)

export const Default = Template.bind({})
