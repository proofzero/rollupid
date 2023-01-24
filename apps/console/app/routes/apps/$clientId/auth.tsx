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
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'
import rotateSecrets, { RollType } from '~/helpers/rotation'

import { z } from 'zod'

/**
 * @file app/routes/dashboard/index.tsx
 */

type notificationHandlerType = (val: boolean) => void

const HTTP_MESSAGE = 'HTTP can only be used for localhost'

const updatesSchema = z.object({
  name: z.string(),
  icon: z.string().url({ message: 'Invalid image upload' }),
  redirectURI: z.union([
    z.string().regex(
      /**
       * I think regex here is the only option.
       * Brief explanation:
       * http([s]){0,1}                 - checks if it's http or https
       * ((http([s]){0,1}:\/\/){1}      - requires protocol to be set (http:// or https://)
       * (localhost|127.0.0.1){1}       - allows only localhost as domain and requires on of them
       * (
       *  (
       *   (([:]){1}[0-9]{4}) | \/ ){1} - checks if the next characters are port or slash
       *                                  it requires port to be ":xxxx" - 5 characters where x is from 0 to 9
       *    [a-zA-Z0-9/.?=&:#]*         - allows all url route characters
       *  ){0,1}                        - makes this whole bracket optional
       * )
       */
      /((http([s]){0,1}:\/\/){1}(localhost|127.0.0.1){1}(((([:]){1}[0-9]{4})|\/){1}[a-zA-Z0-9/.?=&:#]*){0,1}){1}/,
      { message: HTTP_MESSAGE }
    ),
    z.string().url().startsWith('https://', {
      message: HTTP_MESSAGE,
    }),
  ]),
  termsURL: z
    .union([
      z
        .string()
        .regex(
          /((http([s]){0,1}:\/\/){1}(localhost|127.0.0.1){1}(((([:]){1}[0-9]{4})|\/){1}[a-zA-Z0-9/.?=&:#]*){0,1}){1}/,
          { message: HTTP_MESSAGE }
        ),
      z.string().url().startsWith('https://', {
        message: HTTP_MESSAGE,
      }),
      z.string().length(0),
    ])
    .optional(),
  websiteURL: z
    .union([
      z
        .string()
        .regex(
          /((http([s]){0,1}:\/\/){1}(localhost|127.0.0.1){1}(((([:]){1}[0-9]{4})|\/){1}[a-zA-Z0-9/.?=&:#]*){0,1}){1}/,
          { message: HTTP_MESSAGE }
        ),
      z.string().url().startsWith('https://', {
        message: HTTP_MESSAGE,
      }),
      z.string().length(0),
    ])
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

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }
  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })

  const scopeMeta = await starbaseClient.getScopes.query()

  return json({ scopeMeta })
}

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  let rotatedSecret, updates

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
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
    case 'roll_app_secret':
      rotatedSecret = (
        await rotateSecrets(
          starbaseClient,
          params.clientId,
          RollType.RollClientSecret
        )
      ).rotatedClientSecret
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
  const outletContextData =
    useOutletContext<{
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
                    op: 'roll_app_secret',
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
