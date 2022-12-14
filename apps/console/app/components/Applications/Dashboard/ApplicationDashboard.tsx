import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { LoginsPanel } from '../LoginsPanel/LoginsPanel'

type ApplicationDashboardProps = {
  galaxyGql: {
    apiKey: string
    createdAt: Date
  }
  oAuth: {
    appId: string
    appSecret: string
    createdAt: Date
  }
  logins?: any[]
}

export const ApplicationDashboard = ({
  galaxyGql,
  oAuth,
}: ApplicationDashboardProps) => (
  <section>
    <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
      Dashboard
    </Text>

    <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
      <div className="flex-1 flex flex-col space-y-5">
        <Panel title="Galaxy GraphQL API Key">
          <ReadOnlyInput
            id="gqlApiKey"
            label="API Key"
            value={galaxyGql.apiKey}
            hidden
          />
        </Panel>

        <Panel title="0xAuth">
          <div className="flex flex-col space-y-4">
            <ReadOnlyInput
              id="oAuthAppId"
              label="Application ID"
              value={oAuth.appId}
            />
            <ReadOnlyInput
              id="oAuthAppSecret"
              label="Application Secret"
              value={oAuth.appSecret}
              hidden
            />
          </div>
        </Panel>

        <Panel title="Smart Contracts">
          <div className="flex justify-center p-8">
            <Button btnType="secondary-alt" btnSize="xxl">
              Connect Smart Contract
            </Button>
          </div>
        </Panel>
      </div>

      <div className="flex-1">
        <LoginsPanel />
      </div>
    </div>
  </section>
)
