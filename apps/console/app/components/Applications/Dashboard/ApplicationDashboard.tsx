import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { LoginsPanel } from '../LoginsPanel/LoginsPanel'
import { RotateCredsModal } from '~/components/RotateCredsModal/RotateCredsModal'
import { useState } from 'react'
import { FaCopy } from 'react-icons/fa'
import { Toaster, toast } from 'react-hot-toast'

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
}: ApplicationDashboardProps) => {

  const [apiKeyRollModalOpen, setApiKeyRollModalOpen] = useState(false)
  const [clientSecretRollModalOpen, setClientSecretRollModalOpen] = useState(false)

  return (
    <section>
      <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
        Dashboard
      </Text>

      <Toaster position="top-right" reverseOrder={false} />
      <RotateCredsModal
        isOpen={apiKeyRollModalOpen}
        rotateCallback={() => {
          setApiKeyRollModalOpen(false)
          galaxyGql.onKeyRoll()
        }}
        closeCallback={() => setApiKeyRollModalOpen(false)} />
      <RotateCredsModal
        isOpen={clientSecretRollModalOpen}
        rotateCallback={() => {
          setClientSecretRollModalOpen(false)
          oAuth.onKeyRoll()
        }}
        closeCallback={() => setClientSecretRollModalOpen(false)} />

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
                    onClick={() => setApiKeyRollModalOpen(true)}
                  >
                    Roll keys
                  </Text>
                </div>
              </div>
            }
          >
            <div className='flex justify-end' >
              <Text size='sm' 
                weight="medium"
                className={(!galaxyGql.apiKey ? 'hidden' : '') + ' absolute text-indigo-500 cursor-pointer py-1'}
                onClick={() => {
                  navigator.clipboard.writeText(galaxyGql.apiKey || '')
                  toast.success("API key copied to clipboard!", { duration: 2000 })
                }}
                >
                  <FaCopy className='mr-3'></FaCopy>
                </Text>
            </div>
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
                    onClick={() => setClientSecretRollModalOpen(true)}
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
              <div className='flex justify-end' >
                <Text size='sm'
                  weight="medium"
                  className={(!oAuth.appSecret ? 'hidden' : '') + ' absolute text-indigo-500 cursor-pointer py-4'}
                  onClick={() => {
                    navigator.clipboard.writeText(oAuth.appSecret || '')
                    toast.success("Client secret copied to clipboard!", { duration: 2000 })
                  }}
                >
                  <FaCopy className='mr-3'></FaCopy>
                </Text>
              </div>
              <ReadOnlyInput
                id="oAuthAppSecret"
                label="Application Secret"
                value={oAuth.appSecret ?? 's3cr3t-l337-h4x0r5'}
                hidden={oAuth.appSecret ? false : true}
              ></ReadOnlyInput>
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
}
