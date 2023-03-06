import { LoginsPanel } from './LoginsPanel'

export default {
  title: 'Molecules/Applications/Dashboard/Logins',
  component: LoginsPanel,
}

const Template = () => (
  <LoginsPanel
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
  />
)

export const Default = Template.bind({})
