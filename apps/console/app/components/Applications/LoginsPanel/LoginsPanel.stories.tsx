import { LoginsPanel } from './LoginsPanel'

export default {
  title: 'Molecules/Applications/Dashboard/Logins',
  component: LoginsPanel,
}

const Template = () => (
  <LoginsPanel
    authorizedProfiles={[
      { name: 'Eve', timestamp: 1672549200000, accountURN: '' },
      {
        name: 'Bob',
        timestamp: 1672549200000 + 1000,
        accountURN: '',
      },
      {
        name: 'Sam',
        timestamp: 1672549200000 + 2000,
        accountURN: '',
      },
    ]}
  />
)

export const Default = Template.bind({})
