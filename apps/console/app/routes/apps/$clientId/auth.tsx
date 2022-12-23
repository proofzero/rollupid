/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react'
import { ApplicationAuth } from '~/components/Applications/Auth/ApplicationAuth'
import { getStarbaseClient } from '~/utilities/platform.server'
import { requireJWT } from '~/utilities/session.server'

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
  const starbaseClient = getStarbaseClient(jwt)

  const appDetails = (await starbaseClient.kb_appDetails(params.clientId)) as {
    appId: string
    clientId: string
    published: boolean
    secretTimestamp?: number
    name: string
    redirectURI?: string
    termsURL?: string
    websiteURL?: string
    twitterUser?: string
    mediumUser?: string
    mirrorURL?: string
    discordUser?: string
  }

  let rotatedSecret
  if (!appDetails.secretTimestamp) {
    rotatedSecret = await starbaseClient.kb_appRotateSecret(appDetails.clientId)

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
    app: appDetails,
    rotatedSecret,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  let rotatedSecret

  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  const formData = await request.formData()
  const op = formData.get('op')

  // As part of the rolling operation
  // we only need to remove the keys
  // because the loader gets called again
  // populating the values if empty
  switch (op) {
    case 'roll_app_secret':
      rotatedSecret = (
        await starbaseClient.kb_appRotateSecret(params.clientId)
      ).secret.split(':')[1]
      break
    case 'update_app':
      await starbaseClient.kb_appUpdate({
        clientId: params.clientId,
        updates: {
          name: formData.get('name') as string,
          published: formData.get('published') === '1' ? true : false,
          redirectURI: formData.get('redirectURI') as string | undefined,
          termsURL: formData.get('termsURL') as string | undefined,
          websiteURL: formData.get('websiteURL') as string | undefined,
          twitterUser: formData.get('twitterUser') as string | undefined,
          mediumUser: formData.get('mediumUser') as string | undefined,
          mirrorURL: formData.get('mirrorURL') as string | undefined,
          discordUser: formData.get('discordUser') as string | undefined,
        },
      })

      break
  }

  return {
    rotatedSecret,
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()

  const { app } = useLoaderData()
  const rotatedSecret =
    useLoaderData()?.rotatedSecret || useActionData()?.rotatedSecret

  return (
    <Form method="post">
      <input type="hidden" name="op" value="update_app" />
      <ApplicationAuth
        app={app}
        oAuth={{
          appId: app.appId,
          appSecret: rotatedSecret,
          createdAt: new Date(app.secretTimestamp),
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
        onDelete={() => {}}
      />
    </Form>
  )
}
