import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Panel } from '@kubelt/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@kubelt/design-system/src/atoms/form/ReadOnlyInput'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { CTA } from '@kubelt/design-system/src/molecules/cta/cta'
import { LoginsPanel } from '../LoginsPanel/LoginsPanel'
import { RotateCredsModal } from '../../RotateCredsModal/RotateCredsModal'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import type { AuthorizedProfile } from '~/types'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import { NestedErrorPage } from '@kubelt/design-system/src/pages/nested-error/NestedErrorPage'

type ApplicationDashboardProps = {
  galaxyGql: {
    apiKey?: string
    createdAt: Date
    onKeyRoll: () => void
  }
  CTAprops: {
    clickHandler: () => void
    CTAneeded: boolean
  }
  oAuth: {
    appId: string
    appSecret?: string
    createdAt: Date
    onKeyRoll: () => void
  }
  fetcherState: { loadingDetails: string; type: string }
  authorizedProfiles: AuthorizedProfile[]
  error?: any
}

export const ApplicationDashboard = ({
  galaxyGql,
  oAuth,
  CTAprops,
  authorizedProfiles,
  fetcherState,
  error,
}: ApplicationDashboardProps) => {
  const [apiKeyRollModalOpen, setApiKeyRollModalOpen] = useState(false)
  const [clientSecretRollModalOpen, setClientSecretRollModalOpen] =
    useState(false)

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
        closeCallback={() => setApiKeyRollModalOpen(false)}
      />
      <RotateCredsModal
        isOpen={clientSecretRollModalOpen}
        rotateCallback={() => {
          setClientSecretRollModalOpen(false)
          oAuth.onKeyRoll()
        }}
        closeCallback={() => setClientSecretRollModalOpen(false)}
      />

      {CTAprops?.CTAneeded && (
        <div className="mb-3">
          <CTA
            clickHandler={CTAprops.clickHandler}
            header="You're almost there!"
            description="Head on to the OAuth page to complete the setup"
            btnText="Complete Setup"
          />
        </div>
      )}
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
            <ReadOnlyInput
              id="gqlApiKey"
              label="API Key"
              value={galaxyGql.apiKey ?? 's3cr3t-l337-h4x0r5'}
              hidden={galaxyGql.apiKey ? false : true}
              copyable={galaxyGql.apiKey ? true : false}
              onCopy={() =>
                toast.success('Client secret copied to clipboard!', {
                  duration: 2000,
                })
              }
            />
          </Panel>

          <Panel
            title="OAuth"
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
                label="Client ID"
                value={oAuth.appId}
                copyable
                onCopy={() =>
                  toast.success('Client ID copied to clipboard!', {
                    duration: 2000,
                  })
                }
              />

              <ReadOnlyInput
                id="oAuthAppSecret"
                label="Client Secret"
                value={oAuth.appSecret ?? 's3cr3t-l337-h4x0r5'}
                hidden={oAuth.appSecret ? false : true}
                copyable={oAuth.appSecret ? true : false}
                onCopy={() =>
                  toast.success('Client secret copied to clipboard!', {
                    duration: 2000,
                  })
                }
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
          <div className="flex h-full flex-col">
            <Text className="text-gray-600 py-3" weight="medium" size="lg">
              Users
            </Text>
            {fetcherState.loadingDetails !== 'idle' && (
              <div
                className="flex bg-white justify-center items-center h-full
            rounded-lg border shadow"
              >
                <Spinner />
              </div>
            )}
            {fetcherState.type === 'done' && error && <NestedErrorPage />}
            {fetcherState.type === 'done' && !error && (
              <LoginsPanel
                authorizedProfiles={authorizedProfiles}
                appId={oAuth.appId}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
