/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import type { ScopeMeta } from '@proofzero/security/scopes'
import { json } from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useSubmit,
  useOutletContext,
  useLoaderData,
} from '@remix-run/react'
import createCoreClient from '@proofzero/platform-clients/core'
import { requireJWT } from '~/utilities/session.server'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { RollType } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import { DeleteAppModal } from '~/components/DeleteAppModal/DeleteAppModal'
import type { appDetailsProps, errorsAuthProps } from '~/types'
import IconPicker from '@proofzero/design-system/src/atoms/form/IconPicker'
import { RotateCredsModal } from '~/components/RotateCredsModal/RotateCredsModal'

import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Panel } from '@proofzero/design-system/src/atoms/panels/Panel'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { MultiSelect } from '@proofzero/design-system/src/atoms/form/MultiSelect'
import { Button } from '@proofzero/design-system'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import type { AccountURN } from '@proofzero/urns/account'
import type { PaymasterType } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import type { notificationHandlerType } from '~/types'
import { SCOPE_SMART_CONTRACT_WALLETS } from '@proofzero/security/scopes'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import createImageClient from '@proofzero/platform-clients/image'
import { captureFormSubmitAndReplaceImages } from '@proofzero/design-system/src/utils/form-cf-images'

/**
 * @file app/routes/dashboard/index.tsx
 */

// TODO: create a separate helper file for schemas and helper functions

const HTTP_MESSAGE = 'HTTP can only be used for localhost'

const URL_VALIDATION = ({
  val,
  required,
}: {
  val: string
  required: boolean
}) => {
  if (val?.length) {
    try {
      const url = new URL(val)
      const isLocal =
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1'].includes(url.hostname)
      return isLocal || url.protocol === 'https:'
    } catch (ex) {
      return false
    }
  }
  return !required
}

const updatesSchema = z.object({
  name: z.string(),
  icon: z.string().url({ message: 'Invalid image upload' }),
  redirectURI: z.string().refine(
    (val) => {
      return URL_VALIDATION({ val, required: true })
    },
    { message: HTTP_MESSAGE }
  ),
  scopes: z.array(z.string()).refine(
    (val) => {
      return val && val.length
    },
    { message: 'At least one allowed scope value must be set' }
  ),

  termsURL: z
    .string()
    .refine(
      (val) => {
        return URL_VALIDATION({ val, required: false })
      },
      { message: HTTP_MESSAGE }
    )
    .optional(),
  privacyURL: z.string().refine(
    (val) => {
      return URL_VALIDATION({ val, required: true })
    },
    { message: HTTP_MESSAGE }
  ),
  websiteURL: z
    .string()
    .refine(
      (val) => {
        return URL_VALIDATION({ val, required: false })
      },
      { message: HTTP_MESSAGE }
    )
    .optional(),
})

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
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

    const scopeMeta = (await coreClient.starbase.getScopes.query()).scopes

    return json({ scopeMeta })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Application Client ID is required for the requested route',
      })
    }

    let rotatedSecret, updates

    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const paymaster = await coreClient.starbase.getPaymaster.query({
      clientId: params.clientId as string,
    })

    const formData = await request.formData()
    const op = formData.get('op')
    const published = formData.get('published') === '1'
    const errors: errorsAuthProps = {}

    // As part of the rolling operation
    // we only need to remove the keys
    // because the loader gets called again
    // populating the values if empty
    switch (op) {
      case RollType.RollClientSecret:
        rotatedSecret = (
          await coreClient.starbase.rotateClientSecret.mutate({
            clientId: params.clientId,
          })
        ).secret
        break
      case 'update_app':
        const appDetails = await coreClient.starbase.getAppDetails.query({
          clientId: params.clientId,
        })

        const entries = formData.entries()
        const scopes = Array.from(entries)
          .filter((entry) => {
            return entry[0].endsWith('][id]')
          })
          .map((entry) => entry[1] as string)

        if (
          scopes.includes(Symbol.keyFor(SCOPE_SMART_CONTRACT_WALLETS)!) &&
          (!paymaster || !paymaster?.provider)
        ) {
          errors['paymaster'] = 'Paymaster is required for this scope'
        }

        updates = {
          name: formData.get('name')?.toString(),
          icon: formData.get('icon') as string | undefined,
          redirectURI: formData.get('redirectURI') as string | undefined,
          termsURL: formData.get('termsURL') as string | undefined,
          privacyURL: formData.get('privacyURL') as string | undefined,
          websiteURL: formData.get('websiteURL') as string | undefined,
          scopes,
        }

        const zodErrors = updatesSchema.safeParse(updates)
        if (!zodErrors.success) {
          zodErrors.error.errors.forEach((er: any) => {
            errors[`${er.path[0]}`] = er.message
          })
        }

        if (Object.keys(errors).length === 0) {
          const oauthLogo = appDetails.app?.icon

          await Promise.all([
            coreClient.starbase.updateApp.mutate({
              clientId: params.clientId,
              updates,
            }),
            coreClient.starbase.publishApp.mutate({
              clientId: params.clientId,
              published: published,
            }),
          ])

          if (oauthLogo && oauthLogo !== updates.icon) {
            const imageClient = createImageClient(context.env.Images, {
              headers: generateTraceContextHeaders(context.traceSpan),
            })

            context.waitUntil(imageClient.delete.mutate(oauthLogo))
          }
        }
        break
    }
    console.debug('ERRORS', errors)

    return json({
      rotatedSecret,
      updatedApp: { published, app: { ...updates } },
      errors,
      published,
    })
  }
)

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContextData = useOutletContext<{
    notificationHandler: notificationHandlerType
    appDetails: appDetailsProps
    authorizationURL: string
    rotationResult: any
    paymaster: PaymasterType
    appContactAddress?: AccountURN
  }>()
  const {
    appContactAddress,
    paymaster,
    notificationHandler,
    appDetails,
    authorizationURL,
  } = outletContextData
  const { scopeMeta }: { scopeMeta: ScopeMeta } = useLoaderData()

  const ref = useRef(null)
  const [multiselectComponentWidth, setMultiselectComponentWidth] = useState(0)

  useEffect(() => {
    if (!ref || !ref.current) {
      return
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (ref?.current) {
        if (ref.current.offsetWidth !== multiselectComponentWidth) {
          setMultiselectComponentWidth(ref.current.offsetWidth)
        }
      }
    })

    resizeObserver.observe(ref.current)

    // if useEffect returns a function, it is called right before the
    // component unmounts, so it is the right place to stop observing
    // the div
    return function cleanup() {
      resizeObserver.disconnect()
    }
  }, [ref.current])

  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isImgUploading, setIsImgUploading] = useState(false)
  const [rollKeyModalOpen, setRollKeyModalOpen] = useState(false)

  const rotatedSecret =
    outletContextData?.rotationResult?.rotatedClientSecret ||
    actionData?.rotatedSecret

  useEffect(() => {
    if (actionData?.updatedApp) Object.assign(appDetails, actionData.updatedapp)
  }, [actionData])

  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
      setIsFormChanged(!(Object.keys(errors).length === 0))
    }
  }, [errors])

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  return (
    <>
      {isImgUploading ? <Loader /> : null}
      {appDetails.clientId && (
        <DeleteAppModal
          appClientID={appDetails.clientId}
          appName={appDetails.app.name}
          appHasCustomDomain={Boolean(appDetails.customDomain)}
          isOpen={deleteModalOpen}
          deleteAppCallback={() => setDeleteModalOpen(false)}
        />
      )}

      <Form
        method="post"
        encType="multipart/form-data"
        onChange={() => {
          setIsFormChanged(true)
        }}
        onSubmitCapture={(event) =>
          captureFormSubmitAndReplaceImages(event, submit, setIsImgUploading)
        }
      >
        <fieldset disabled={isImgUploading}>
          <input type="hidden" name="op" value="update_app" />

          <section className="flex flex-col space-y-5">
            <div className="flex flex-row justify-between space-x-5 max-sm:pl-6">
              <div className="flex flex-row items-center space-x-3">
                <Text size="2xl" weight="semibold" className="text-gray-900">
                  OAuth
                </Text>
                <DocumentationBadge
                  url={'https://docs.rollup.id/platform/console/oauth'}
                />
              </div>
              <Button
                type="submit"
                btnType="primary-alt"
                disabled={!isFormChanged || isImgUploading}
              >
                Save
              </Button>
            </div>

            <RotateCredsModal
              isOpen={rollKeyModalOpen}
              rotateCallback={() => {
                setRollKeyModalOpen(false)
                submit(
                  {
                    op: RollType.RollClientSecret,
                  },
                  {
                    method: 'post',
                  }
                )
              }}
              closeCallback={() => setRollKeyModalOpen(false)}
            />

            {!appContactAddress && (
              <ToastWithLink
                message="Connect email address to enable publishing"
                linkHref={`/apps/${appDetails.clientId}/team`}
                linkText="Connect email address"
                type="warning"
              />
            )}

            <div className="flex flex-col md:flex-row space-y-5 lg:space-y-0 lg:space-x-5">
              <div className="flex-1">
                <Panel title="OAuth Settings">
                  <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
                    <div className="flex-1">
                      <ReadOnlyInput
                        id="oAuthAppId"
                        label="Client ID"
                        value={appDetails.clientId!}
                        copyable
                        onCopy={() =>
                          toast(
                            ToastType.Success,
                            { message: 'Client ID copied to clipboard!' },
                            {
                              duration: 2000,
                            }
                          )
                        }
                        disabled
                      />
                    </div>

                    <div className="flex-1">
                      <ReadOnlyInput
                        id="oAuthAppSecret"
                        label="Client Secret"
                        value={rotatedSecret ?? 's3cr3t-l337-h4x0r5'}
                        hidden={rotatedSecret ? false : true}
                        copyable={rotatedSecret ? true : false}
                        onCopy={() =>
                          toast(
                            ToastType.Success,
                            { message: 'Client secret copied to clipboard!' },
                            {
                              duration: 2000,
                            }
                          )
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Text
                        size="xs"
                        weight="medium"
                        className="text-gray-400 text-right md:text-left"
                      >
                        Created:{' '}
                        {new Date(
                          appDetails.secretTimestamp as number
                        ).toDateString()}
                      </Text>

                      <div className="text-right">
                        <Text
                          type="span"
                          size="xs"
                          weight="medium"
                          className="text-indigo-500 cursor-pointer"
                          onClick={() => setRollKeyModalOpen(true)}
                        >
                          Roll keys
                        </Text>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              <div>
                <Panel title="Application Status">
                  <div className="flex flex-col h-full justify-center">
                    <InputToggle
                      name="published"
                      id="published"
                      label="Published"
                      disabled={!appContactAddress}
                      onToggle={() => {
                        ;(setIsFormChanged as (val: boolean) => {})(true)
                      }}
                      checked={appDetails.published}
                    />
                  </div>
                </Panel>
              </div>
            </div>

            <Panel title="Details">
              <div className="flex flex-col md:space-y-5">
                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
                  <div className="flex-1">
                    <Input
                      id="name"
                      label="Application Name"
                      error={errors?.['name']}
                      defaultValue={appDetails.app.name}
                      required
                    />
                    <div className="sm:mb-[1.755rem]" />
                  </div>

                  <div ref={ref} className="flex-1">
                    <MultiSelect
                      label="Allowed scope*"
                      disabled={false}
                      onChange={() => {
                        setIsFormChanged(true)
                      }}
                      width={multiselectComponentWidth}
                      learnMore="https://docs.rollup.id/reference/scopes"
                      fieldName="scopes"
                      items={Object.entries(scopeMeta).map(([key, value]) => {
                        let disabled, section
                        if (
                          key === Symbol.keyFor(SCOPE_SMART_CONTRACT_WALLETS)
                        ) {
                          if (
                            !paymaster ||
                            !paymaster?.provider ||
                            !paymaster?.secret
                          ) {
                            disabled = true
                            section = 'Blockchain'
                          }
                        }
                        return {
                          id: key,
                          val: value.name,
                          desc: value.devDescription!,
                          disabled,
                          section,
                          experimental: value.experimental,
                        }
                      })}
                      preselectedItems={(
                        appDetails.app.scopes as Array<string>
                      ).map((scope) => {
                        const meta = scopeMeta[scope]
                        return {
                          id: scope,
                          val: meta.name,
                          desc: meta.devDescription,
                        }
                      })}
                    />
                    {errors?.scopes ? (
                      <Text
                        className="mb-1.5 mt-1.5 text-red-500"
                        size="xs"
                        weight="normal"
                      >
                        {errors.scopes || ''}
                      </Text>
                    ) : (
                      <div className="sm:mb-[1.755rem]" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-8 my-4 md:space-y-0 md:space-x-8 md:items-end">
                  <div className="flex-1 mb-1">
                    <IconPicker
                      label="Upload Icon* (256x256)"
                      maxSize={1048576}
                      id="icon"
                      errorMessage={errors?.['icon']}
                      invalid={
                        errors !== undefined &&
                        errors.hasOwnProperty('icon') &&
                        (errors['icon'] as string).length > 0
                      }
                      setIsFormChanged={
                        setIsFormChanged as (val: boolean) => void
                      }
                      setIsImgUploading={
                        setIsImgUploading as (val: boolean) => void
                      }
                      url={appDetails.app.icon}
                    />
                  </div>

                  <div className="flex-1">
                    <Input
                      id="redirectURI"
                      label="Redirect URL"
                      type="url"
                      required
                      error={errors?.['redirectURI']}
                      placeholder="https://www.example.com"
                      defaultValue={appDetails.app.redirectURI}
                    />
                    {errors?.redirectURI ? (
                      <Text
                        className="mb-1.5 mt-1.5 text-red-500"
                        size="xs"
                        weight="normal"
                      >
                        {errors.redirectURI || ''}
                      </Text>
                    ) : (
                      <div className="sm:mb-[1.755rem]" />
                    )}
                  </div>
                </div>

                <hr />

                <div className="w-[500px] space-y-3">
                  <ReadOnlyInput
                    id="oAuthAppAuthURL"
                    label="My Auth URL"
                    className="text-ellipsis"
                    value={
                      appDetails.published
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

            <Panel title="Links">
              <div className="flex flex-col space-y-8 md:space-y-5 truncate">
                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:items-end">
                  <div className="flex-1">
                    <Input
                      required
                      id="termsURL"
                      label="Terms of Service"
                      type="url"
                      error={errors?.['termsURL']}
                      placeholder="https://www.example.com"
                      defaultValue={appDetails.app.termsURL}
                    />
                    {errors?.termsURL ? (
                      <Text
                        className="mb-1.5 mt-1.5 text-red-500"
                        size="xs"
                        weight="normal"
                      >
                        {errors.termsURL || ''}
                      </Text>
                    ) : (
                      <div className="sm:mb-[1.755rem]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <Input
                      required
                      id="privacyURL"
                      label="Privacy Policy"
                      type="url"
                      error={errors?.['privacyURL']}
                      placeholder="https://www.example.com"
                      defaultValue={appDetails.app.privacyURL}
                    />
                    {errors?.privacyURL ? (
                      <Text
                        className="mb-1.5 mt-1.5 text-red-500"
                        size="xs"
                        weight="normal"
                      >
                        {errors.privacyURL || ''}
                      </Text>
                    ) : (
                      <div className="sm:mb-[1.755rem]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <Input
                      required
                      id="websiteURL"
                      label="Website"
                      error={errors?.['websiteURL']}
                      type="url"
                      placeholder="https://www.example.com"
                      defaultValue={appDetails.app.websiteURL}
                    />
                    {errors?.websiteURL ? (
                      <Text
                        className="mb-1.5 mt-1.5 text-red-500"
                        size="xs"
                        weight="normal"
                      >
                        {errors.websiteURL || ''}
                      </Text>
                    ) : (
                      <div className="sm:mb-[1.755rem]" />
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Danger Zone">
              <Button
                type="button"
                btnType="dangerous-alt"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete the Application
              </Button>
            </Panel>
          </section>
        </fieldset>
      </Form>
    </>
  )
}
