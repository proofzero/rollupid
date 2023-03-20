/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */
import { Suspense, useState } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { defer, json } from '@remix-run/cloudflare'
import {
  useActionData,
  useOutletContext,
  useSubmit,
  useNavigate,
  useLoaderData,
  Await,
} from '@remix-run/react'
import invariant from 'tiny-invariant'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Panel } from '@proofzero/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { CTA } from '@proofzero/design-system/src/molecules/cta/cta'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'

import { LoginsPanel } from '~/components/Applications/LoginsPanel/LoginsPanel'
import { RotateCredsModal } from '~/components/RotateCredsModal/RotateCredsModal'
import type { appDetailsProps } from '~/types'

import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'

import { RollType } from '~/types'
import type { RotatedSecrets } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { loader as usersLoader } from './users'
import type { AuthorizedAccountsOutput } from '@proofzero/platform/starbase/src/types'
import type { UsersLoaderData } from './users'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const NUMBER_OF_DISPLAYED_USERS = 8

type LoaderData = {
  edgesResult: Promise<AuthorizedAccountsOutput>
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { clientId } = params
  const { data }: { data: UsersLoaderData } = await usersLoader({
    request,
    params,
    context,
  })

  if (!clientId) {
    throw new Error('clientId is required')
  }

  return defer<LoaderData>({
    edgesResult: data.edgesResult!,
  })
}

export const action: ActionFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Application Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const formData = await request.formData()
  const op = formData.get('op')
  invariant(op && typeof op === 'string', 'Operation should be a string')

  switch (op) {
    case RollType.RollAPIKey:
      const rotatedApiKey = (
        await starbaseClient.rotateApiKey.mutate({ clientId: params.clientId })
      ).apiKey
      return json({
        rotatedSecrets: { rotatedApiKey },
      })
    case RollType.RollClientSecret:
      const rotatedClientSecret = (
        await starbaseClient.rotateClientSecret.mutate({
          clientId: params.clientId,
        })
      ).secret
      return json({
        rotatedSecrets: { rotatedClientSecret },
      })
    default:
      throw new Error('Invalid operation')
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContext = useOutletContext<{
    appDetails: appDetailsProps
    rotationResult: RotatedSecrets
  }>()
  const { edgesResult } = useLoaderData()

  const navigate = useNavigate()

  const [apiKeyRollModalOpen, setApiKeyRollModalOpen] = useState(false)
  const [clientSecretRollModalOpen, setClientSecretRollModalOpen] =
    useState(false)

  const { appDetails: app } = outletContext

  const { rotatedClientSecret, rotatedApiKey } =
    outletContext?.rotationResult ||
      actionData?.rotatedSecrets || {
        rotatedClientSecret: null,
        rotatedApiKey: null,
      }

  return (
    <section>
      <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
        Dashboard
      </Text>

      <RotateCredsModal
        isOpen={apiKeyRollModalOpen}
        rotateCallback={() => {
          setApiKeyRollModalOpen(false)
          submit(
            {
              op: RollType.RollAPIKey,
            },
            {
              method: 'post',
            }
          )
        }}
        closeCallback={() => setApiKeyRollModalOpen(false)}
      />
      <RotateCredsModal
        isOpen={clientSecretRollModalOpen}
        rotateCallback={() => {
          setClientSecretRollModalOpen(false)
          submit(
            {
              op: RollType.RollClientSecret,
            },
            {
              method: 'post',
            }
          )
        }}
        closeCallback={() => setClientSecretRollModalOpen(false)}
      />

      {(!app.app.icon || !app.app.redirectURI || !app.app.name) && (
        <div className="mb-3">
          <CTA
            clickHandler={() => {
              navigate('./auth')
            }}
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
                  Created: {new Date(app.apiKeyTimestamp!).toDateString()}
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
              value={rotatedApiKey ?? 's3cr3t-l337-h4x0r5'}
              hidden={rotatedApiKey ? false : true}
              copyable={rotatedApiKey ? true : false}
              onCopy={() =>
                toast(
                  ToastType.Success,
                  { message: 'Client secret copied to clipboard!' },
                  { duration: 2000 }
                )
              }
            />
          </Panel>

          <Panel
            title="OAuth"
            titleCompanion={
              <div>
                <Text size="xs" weight="medium" className="text-gray-400">
                  Created: {new Date(app.secretTimestamp as number).toString()}
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
                value={app.clientId!}
                copyable
                onCopy={() =>
                  toast(
                    ToastType.Success,
                    { message: 'Client ID copied to clipboard!' },
                    { duration: 2000 }
                  )
                }
              />

              <ReadOnlyInput
                id="oAuthAppSecret"
                label="Client Secret"
                value={rotatedClientSecret ?? 's3cr3t-l337-h4x0r5'}
                hidden={rotatedClientSecret ? false : true}
                copyable={rotatedClientSecret ? true : false}
                onCopy={() =>
                  toast(
                    ToastType.Success,
                    { message: 'Client secret copied to clipboard!' },
                    { duration: 2000 }
                  )
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
            <Text className="text-gray-900 py-3 px-6" weight="medium" size="lg">
              Users
            </Text>{' '}
            <Suspense
              fallback={
                <div
                  className="flex bg-white justify-center items-center h-full
            rounded-lg border shadow"
                >
                  <Spinner />
                </div>
              }
            >
              <Await resolve={edgesResult} errorElement={<NestedErrorPage />}>
                {(edgesResult) => {
                  return (
                    <LoginsPanel
                      authorizedProfiles={
                        edgesResult.accounts.slice(
                          0,
                          NUMBER_OF_DISPLAYED_USERS
                        ) || []
                      }
                      appId={app.clientId!}
                    />
                  )
                }}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
