/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useSubmit,
  useOutletContext,
  useLoaderData,
} from '@remix-run/react'
import { ApplicationAuth } from '~/components/Applications/Auth/ApplicationAuth'
import type {
  appDetailsProps,
  errorsAuthProps,
} from '~/components/Applications/Auth/ApplicationAuth'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { DeleteAppModal } from '~/components/DeleteAppModal/DeleteAppModal'
import { useEffect, useState } from 'react'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'

import { z } from 'zod'
import { RollType } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

/**
 * @file app/routes/dashboard/index.tsx
 */

type notificationHandlerType = (val: boolean) => void

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

  termsURL: z
    .string()
    .refine(
      (val) => {
        return URL_VALIDATION({ val, required: false })
      },
      { message: HTTP_MESSAGE }
    )
    .optional(),
  websiteURL: z
    .string()
    .refine(
      (val) => {
        return URL_VALIDATION({ val, required: false })
      },
      { message: HTTP_MESSAGE }
    )
    .optional(),
  twitterUser: z
    .string()
    .url()
    .startsWith('https://twitter.com/')
    .optional()
    .or(z.string().length(0)),
  mediumUser: z
    .string()
    .url()
    .startsWith('https://medium.com/@')
    .optional()
    .or(z.string().length(0)),
  mirrorURL: z
    .string()
    .url()
    .startsWith('https://mirror.xyz/')
    .optional()
    .or(z.string().length(0)),
  discordUser: z
    .string()
    .url()
    .startsWith('http://discord.com/')
    .optional()
    .or(z.string().length(0)),
})

export const loader: LoaderFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Application Client ID is required for the requested route')
  }
  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const scopeMeta = await starbaseClient.getScopes.query()

  return json({ scopeMeta })
}

export const action: ActionFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Application Client ID is required for the requested route')
  }

  let rotatedSecret, updates

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
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
        await starbaseClient.rotateClientSecret.mutate({
          clientId: params.clientId,
        })
      ).secret
      break
    case 'update_app':
      const entries = formData.entries()
      const scopes = Array.from(entries)
        .filter((entry) => {
          return entry[0].endsWith('][id]')
        })
        .map((entry) => entry[1] as string)

      console.log({ scopes })

      updates = {
        name: formData.get('name')?.toString(),
        icon: formData.get('icon') as string | undefined,
        redirectURI: formData.get('redirectURI') as string | undefined,
        termsURL: formData.get('termsURL') as string | undefined,
        websiteURL: formData.get('websiteURL') as string | undefined,
        twitterUser: formData.get('twitterUser') as string | undefined,
        mediumUser: formData.get('mediumUser') as string | undefined,
        mirrorURL: formData.get('mirrorURL') as string | undefined,
        discordUser: formData.get('discordUser') as string | undefined,
        scopes: Array.from(scopes),
      }

      const zodErrors = updatesSchema.safeParse(updates)
      if (!zodErrors.success) {
        zodErrors.error.errors.forEach((er: any) => {
          errors[`${er.path[0]}`] = er.message
        })
      }

      if (Object.keys(errors).length === 0) {
        await Promise.all([
          starbaseClient.updateApp.mutate({
            clientId: params.clientId,
            updates,
          }),
          starbaseClient.publishApp.mutate({
            clientId: params.clientId,
            published: published,
          }),
        ])
      }
      break
  }

  return json({
    rotatedSecret,
    updatedApp: { published, app: { ...updates } },
    errors,
  })
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContextData = useOutletContext<{
    notificationHandler: notificationHandlerType
    appDetails: appDetailsProps
    rotationResult: any
  }>()
  const { scopeMeta } = useLoaderData()

  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isImgUploading, setIsImgUploading] = useState(false)

  const { notificationHandler, appDetails } = outletContextData
  const rotatedSecret =
    outletContextData?.rotationResult?.rotatedClientSecret ||
    actionData?.rotatedSecret

  if (actionData?.updatedApp) {
    appDetails.app = actionData.updatedApp.app
    appDetails.published = actionData.updatedApp.published
  }

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
      <DeleteAppModal
        clientId={appDetails.clientId as string}
        appName={appDetails.app.name}
        deleteAppCallback={() => {
          setDeleteModalOpen(false)
        }}
        isOpen={deleteModalOpen}
      />

      <Form
        method="post"
        encType="multipart/form-data"
        onChange={() => {
          setIsFormChanged(true)
        }}
      >
        <fieldset disabled={isImgUploading}>
          <input type="hidden" name="op" value="update_app" />
          <ApplicationAuth
            appDetails={appDetails}
            scopeMeta={scopeMeta.scopes}
            setIsImgUploading={setIsImgUploading}
            oAuth={{
              appId: appDetails.clientId as string,
              appSecret: rotatedSecret,
              createdAt: new Date(appDetails.secretTimestamp as number),
              onKeyRoll: () => {
                submit(
                  {
                    op: RollType.RollClientSecret,
                  },
                  {
                    method: 'post',
                  }
                )
              },
            }}
            errors={errors}
            isFormChanged={isFormChanged}
            setIsFormChanged={setIsFormChanged}
            onDelete={() => {
              setDeleteModalOpen(true)
            }}
          />
        </fieldset>
      </Form>
    </>
  )
}
