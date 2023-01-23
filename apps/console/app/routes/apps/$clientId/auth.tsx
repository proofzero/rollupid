/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useSubmit,
  useOutletContext,
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

/**
 * @file app/routes/dashboard/index.tsx
 */

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
  const published = formData.get('published') === '1'
  const errors: errorsAuthProps = {}

  // console.log({ scopes: JSON.stringify(formData) })

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

      const [protocolWebsite, pathWebsite]: any = updates.websiteURL?.split(':')
      const [protocolTerms, pathTerms]: any = updates.termsURL?.split(':')
      const [protocolRedirect, pathRedirect]: any =
        updates.redirectURI?.split(':')

      if (
        protocolWebsite &&
        protocolWebsite === 'http' &&
        pathWebsite.split('.')[0] !== 'localhost' &&
        !pathWebsite.includes('127.0.0.1')
      ) {
        errors['websiteURL'] = 'HTTP can only be used for localhost'
      }

      if (
        protocolTerms &&
        protocolTerms === 'http' &&
        pathTerms.split('.')[0] !== 'localhost' &&
        !pathTerms.includes('127.0.0.1')
      ) {
        errors['termsURL'] = 'HTTP can only be used for localhost'
      }

      if (
        protocolRedirect &&
        protocolRedirect === 'http' &&
        pathRedirect.split('.')[0] !== 'localhost' &&
        !pathRedirect.includes('127.0.0.1')
      ) {
        errors['redirectURI'] = 'HTTP can only be used for localhost'
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
  const [isFormChanged, setIsFormChanged] = useState(false)

  const [isImgUploading, setIsImgUploading] = useState(false)

  const { notificationHandler, appDetails, scopeMeta } = outletContextData
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
        onSubmit={() => {
          setIsFormChanged(false)
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
              createdAt: new Date(
                appDetails.secretTimestamp?.toString() as string
              ),
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
