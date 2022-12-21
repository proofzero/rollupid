import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { LoginsPanel } from '../LoginsPanel/LoginsPanel'

type ApplicationDashboardProps = {
  galaxyGql: {
    apiKey?: string
    createdAt: Date
    onKeyRoll: () => void
  }
  oAuth: {
    appId: string
    appSecret?: string
    createdAt: Date
    onKeyRoll: () => void
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
        <Panel
          title="Galaxy GraphQL API Key"
          titleCompanion={
            <div>
              <Text size="xs" weight="medium" className="text-gray-400">
                Created: {galaxyGql.createdAt.toDateString()}
              </Text>
              <div className="text-right">
                <Text
                  type="span"
                  size="xs"
                  weight="medium"
                  className="text-indigo-500 cursor-pointer"
                  onClick={galaxyGql.onKeyRoll}
                >
                  Roll keys
                </Text>
              </div>
            </div>
          }
        >
          <ReadOnlyInput
            id="gqlApiKey"
            label="API Key"
            value={galaxyGql.apiKey ?? 's3cr3t-l337-h4x0r5'}
            hidden={galaxyGql.apiKey ? false : true}
          />
        </Panel>

        <Panel
          title="0xAuth"
          titleCompanion={
            <div>
              <Text size="xs" weight="medium" className="text-gray-400">
                Created: {oAuth.createdAt.toDateString()}
              </Text>
              <div className="text-right">
                <Text
                  type="span"
                  size="xs"
                  weight="medium"
                  className="text-indigo-500 cursor-pointer"
                  onClick={oAuth.onKeyRoll}
                >
                  Roll keys
                </Text>
              </div>
            </div>
          }
        >
          <div className="flex flex-col space-y-4">
            <ReadOnlyInput
              id="oAuthAppId"
              label="Application ID"
              value={oAuth.appId}
            />
            <ReadOnlyInput
              id="oAuthAppSecret"
              label="Application Secret"
              value={oAuth.appSecret ?? 's3cr3t-l337-h4x0r5'}
              hidden={oAuth.appSecret ? false : true}
            />
          </div>
        </Panel>

        <Panel title="Smart Contracts">
          <div className="flex justify-center p-8">
            <Button btnType="secondary-alt" btnSize="xxl" disabled>
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
