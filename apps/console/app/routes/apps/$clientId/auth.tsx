/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useOutletContext,
} from '@remix-run/react'
import { ApplicationAuth } from '~/components/Applications/Auth/ApplicationAuth'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { DeleteAppModal } from '~/components/DeleteAppModal/DeleteAppModal'
import { useEffect, useState } from 'react'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Client id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })

  const [appDetails, scopeMeta] = await Promise.all([
    starbaseClient.getAppDetails.query({
      clientId: params.clientId,
    }),
    starbaseClient.getScopes.query(),
  ])

  let rotatedSecret
  if (!appDetails.secretTimestamp) {
    rotatedSecret = await starbaseClient.rotateClientSecret.mutate({
      clientId: appDetails.clientId,
    })

    // The prefix is there just as an aide to users;
    // when they're moving these values
    // (client ID, client secret),
    // the prefix should help distinguish between them,
    // rather then the user having to
    // distinguish between them by e.g. length.
    // The prefix is part of the secret and is included in the stored hash.
    rotatedSecret = rotatedSecret.secret.split(':')[1]

    // This is a client 'hack' as the date
    // is populated from the graph
    // on subsequent requests
    appDetails.secretTimestamp = Date.now()
  }

  return json({
    appDetails,
    scopeMeta,
    rotatedSecret,
  })
}

type notificationHandlerType = (val: boolean) => void

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
  const published = formData.get('published') === 'true'

  // console.log({ scopes: JSON.stringify(formData) })

  // As part of the rolling operation
  // we only need to remove the keys
  // because the loader gets called again
  // populating the values if empty
  switch (op) {
    case 'roll_app_secret':
      rotatedSecret = (
        await starbaseClient.rotateClientSecret.mutate({
          clientId: params.clientId,
        })
      ).secret.split(':')[1]
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

      await starbaseClient.updateApp.mutate({
        clientId: params.clientId,
        updates,
      })

      await starbaseClient.publishApp.mutate({
        clientId: params.clientId,
        published: published,
      })

      break
  }

  return {
    rotatedSecret,
    updatedApp: { published, app: { ...updates } },
    errors: {},
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()

  const { notificationHandler } =
    useOutletContext<{ notificationHandler: notificationHandlerType }>()

  const loaderData = useLoaderData()
  const actionData = useActionData()

  const [isFormChanged, setIsFormChanged] = useState(false)
  const { appDetails, scopeMeta } = loaderData
  const rotatedSecret = loaderData?.rotatedSecret || actionData?.rotatedSecret

  if (actionData?.updatedApp) {
    appDetails.app = actionData.updatedApp.app
    appDetails.publised = actionData.updatedApp.published
  }

  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
    }
  }, [errors])

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  return (
    <>
      <DeleteAppModal
        clientId={appDetails.clientId}
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
        onSubmit={() => {
          setIsFormChanged(false)
        }}
      >
        <input type="hidden" name="op" value="update_app" />
        <ApplicationAuth
          appDetails={appDetails}
          scopeMeta={scopeMeta.scopes}
          oAuth={{
            appId: appDetails.clientId,
            appSecret: rotatedSecret,
            createdAt: new Date(appDetails.secretTimestamp),
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
          onTogglePublished={(appDetails: any) => {
            submit(
              {
                ...appDetails.app,
                published: appDetails.published, //|| actionData.published,
                op: 'update_app',
              },
              { method: 'post', replace: true }
            )
            setIsFormChanged(false)
          }}
          isFormChanged={isFormChanged}
          setIsFormChanged={setIsFormChanged}
          onDelete={() => {
            setDeleteModalOpen(true)
          }}
        />
      </Form>
    </>
  )
}
