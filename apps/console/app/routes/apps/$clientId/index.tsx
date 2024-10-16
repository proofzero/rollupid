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

import { Panel } from '@proofzero/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { Button, Text } from '@proofzero/design-system'
import { CTA } from '@proofzero/design-system/src/molecules/cta/cta'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'

import { LoginsPanel } from '~/components/Applications/LoginsPanel/LoginsPanel'
import { RotateCredsModal } from '~/components/RotateCredsModal/RotateCredsModal'
import type { appDetailsProps } from '~/types'

import createCoreClient from '@proofzero/platform-clients/core'
import { requireJWT } from '~/utilities/session.server'

import { RollType } from '~/types'
import type { RotatedSecrets } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { loader as usersLoader } from './users'
import type { AuthorizedIdentitiesOutput } from '@proofzero/platform/starbase/src/types'
import type { UsersLoaderData } from './users'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const NUMBER_OF_DISPLAYED_USERS = 8

type LoaderData = {
  edgesResult: Promise<AuthorizedIdentitiesOutput>
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { clientId } = params
    const { data }: { data: UsersLoaderData } = await usersLoader({
      request,
      params,
      context,
    })

    if (!clientId) {
      throw new BadRequestError({ message: 'clientId is required' })
    }

    return defer<LoaderData>({
      edgesResult: data.edgesResult!,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Application Client ID is required for the requested route',
      })
    }

    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const formData = await request.formData()
    const op = formData.get('op')
    invariant(op && typeof op === 'string', 'Operation should be a string')

    switch (op) {
      case RollType.RollAPIKey:
        const rotatedApiKey = (
          await coreClient.starbase.rotateApiKey.mutate({
            clientId: params.clientId,
          })
        ).apiKey
        return json({
          rotatedSecrets: { rotatedApiKey },
        })
      case RollType.RollClientSecret:
        const rotatedClientSecret = (
          await coreClient.starbase.rotateClientSecret.mutate({
            clientId: params.clientId,
          })
        ).secret
        return json({
          rotatedSecrets: { rotatedClientSecret },
        })
      default:
        throw new BadRequestError({ message: 'Invalid operation' })
    }
  }
)

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContext = useOutletContext<{
    appDetails: appDetailsProps
    authorizationURL: string
    rotationResult: RotatedSecrets
    paymentFailedIdentityGroups: IdentityGroupURN[]
  }>()
  const { edgesResult } = useLoaderData()

  const navigate = useNavigate()

  const [apiKeyRollModalOpen, setApiKeyRollModalOpen] = useState(false)
  const [clientSecretRollModalOpen, setClientSecretRollModalOpen] =
    useState(false)

  const { appDetails: app } = outletContext
  const { authorizationURL } = outletContext

  const { rotatedClientSecret, rotatedApiKey } =
    outletContext?.rotationResult ||
      actionData?.rotatedSecrets || {
        rotatedClientSecret: null,
        rotatedApiKey: null,
      }

  const seatPaymentFailed =
    IdentityGroupURNSpace.is(outletContext.appDetails.ownerURN) &&
    outletContext.paymentFailedIdentityGroups.length > 0 &&
    outletContext.paymentFailedIdentityGroups.includes(
      outletContext.appDetails.ownerURN as IdentityGroupURN
    )

  return (
    <section>
      <div className="flex flex-row items-center space-x-3 pb-5 max-sm:px-6">
        <Text size="2xl" weight="semibold" className="text-gray-900">
          Dashboard
        </Text>
        <DocumentationBadge
          url={'https://docs.rollup.id/platform/console/dashboard'}
        />
      </div>

      {seatPaymentFailed && (
        <section className="my-3">
          <ToastWithLink
            message="Payment for user seats has failed. Update Payment Information to regain full access to the application."
            linkHref={`/billing/groups/${
              outletContext.appDetails.ownerURN.split('/')[1]
            }`}
            linkText="Update payment information"
            type="warning"
          />
        </section>
      )}

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
            title="Galaxy API"
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

              <hr />

              <div className="space-y-3">
                <ReadOnlyInput
                  id="oAuthAppAuthURL"
                  label="My Auth URL"
                  className="text-ellipsis"
                  value={
                    app.published
                      ? authorizationURL
                      : 'Publish the application to get the auth URL'
                  }
                  copyable={true}
                  onCopy={() =>
                    toast(
                      ToastType.Success,
                      { message: 'Auth URL copied to clipboard!' },
                      { duration: 2000 }
                    )
                  }
                />
                <Text size="sm" className="text-gray-500">
                  This link is for testing purposes only! Auth flow won't be
                  successful.
                </Text>
              </div>
            </div>
          </Panel>
        </div>
        <div className="flex-1">
          <div className="flex h-full flex-col">
            <Text className="text-gray-900 py-3" weight="semibold" size="lg">
              Users
            </Text>{' '}
            <Suspense
              fallback={
                <div
                  className="flex bg-white justify-center items-center h-full
            rounded-lg border"
                >
                  <Spinner />
                </div>
              }
            >
              <Await
                resolve={edgesResult}
                errorElement={<NestedErrorPage text={'Data Loading Error'} />}
              >
                {(edgesResult) => {
                  return (
                    <LoginsPanel
                      authorizedProfiles={
                        edgesResult.identities.slice(
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
