import { LoginsPanel } from './LoginsPanel'

export default {
  title: 'Molecules/Applications/Dashboard/Logins',
  component: LoginsPanel,
}

const Template = () => (
  <LoginsPanel
    authorizedProfiles={[
      { name: 'Eve',
        timestamp: 1672549200000,
        identityURN: 'urn:rollupid:identity/Eve',
      },
      {
        name: 'Bob',
        timestamp: 1672549200000 + 1000,
        identityURN: 'urn:rollupid:identity/Bob',
      },
      {
        name: 'Sam',
        timestamp: 1672549200000 + 2000,
        identityURN: 'urn:rollupid:identity/Sam',
      },
    ]}
  />
)

export const Default = Template.bind({})
