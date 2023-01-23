import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit, useTransition } from '@remix-run/react'

import { ResponseType } from '@kubelt/platform.access/src/types'

import {
  getAccessClient,
  getAddressClient,
  getGalaxyClient,
  getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession, parseJwt, requireJWT } from '~/session.server'
import type { AccountURN } from '@kubelt/urns/account'
import {
  CryptoAddressType,
  OAuthAddressType,
} from '@kubelt/platform/address/src/types'

import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { generateGradient } from '~/utils/gradient.server'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')

  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const defaultProfileURN = session.get('defaultProfileUrn') as AddressURN

  const parsedURN = AddressURNSpace.componentizedParse(defaultProfileURN)
  const rparams = parsedURN.rcomponent

  console.log({ defaultProfileURN, parsedURN, rparams })

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(
    {},
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )
  const profile = profileRes.profile

  console.log({ profile })

  if (!profile) {
    console.log("Profile doesn't exist, creating one...")
    const addressClient = getAddressClient(defaultProfileURN)
    const newProfile = await addressClient.getAddressProfile
      .query()
      .then(async (res) => {
        switch (res.type) {
          case CryptoAddressType.ETH: {
            const gradient = await generateGradient(res.profile.address)
            return {
              displayName: res.profile.displayName || res.profile.address,
              pfp: {
                image: res.profile.avatar || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.GitHub: {
            const gradient = await generateGradient(res.profile.login)
            return {
              displayName: res.profile.name || res.profile.login,
              pfp: {
                image: res.profile.avatar_url || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Google: {
            const gradient = await generateGradient(res.profile.email)
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.picture,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Twitter: {
            const gradient = await generateGradient(res.profile.id.toString())
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.profile_image_url_https,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Microsoft: {
            const gradient = await generateGradient(res.profile.sub.toString())
            return {
              displayName: res.profile.name,
              pfp: {
                //Cached profile image
                image: gradient,
              },
              cover: gradient,
            }
          }
          default:
            throw new Error(
              'Unsupported OAuth type encountered in profile response.'
            )
        }
      })

    // set the default profile
    await galaxyClient.updateProfile(
      { profile: newProfile },
      {
        [PlatformJWTAssertionHeader]: jwt,
      }
    )
  }

  // if no client id let's redirect to the first party app select page
  if (!client_id) {
    return redirect('/apps')
  }

  if (!state) {
    throw json({ message: 'Missing required fields: state' }, 400)
  }

  try {
    const sbClient = getStarbaseClient(jwt)

    // When scopes are powered by an index we can just query for the scopes we have in the app
    const [scopeMeta, appProfile] = await Promise.all([
      sbClient.getScopes.query(),
      sbClient.getAppProfile.query({
        clientId: client_id,
      }),
    ])

    return json({
      clientId: client_id,
      appProfile,
      userProfile: profile,
      scopeMeta: scopeMeta,
      state,
    })
  } catch (e) {
    console.error(e)
    throw json({ message: 'Failed to fetch application info' }, 400)
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const form = await request.formData()
  const cancel = form.get('cancel') as string

  if (cancel) {
    return redirect(cancel)
  }

  const jwt = await requireJWT(request)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN
  const responseType = ResponseType.Code
  const redirectUri = form.get('redirect_uri') as string
  const scope = (form.get('scopes') as string).split(',')
  const state = form.get('state') as string
  const clientId = form.get('client_id') as string

  if (!account || !responseType || !redirectUri || !scope || !state) {
    throw json({ message: 'Missing required fields' }, 400)
  }

  const accessClient = getAccessClient()
  const authorizeRes = await accessClient.authorize.mutate({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  })

  console.log({ authorizeRes })

  if (!authorizeRes) {
    throw json({ message: 'Failed to authorize' }, 400)
  }

  return redirect(
    `${redirectUri}?code=${authorizeRes.code}&state=${authorizeRes.state}`
  )
}

export default function Authorize() {
  const { clientId, appProfile, userProfile, scopeMeta, state } =
    useLoaderData()
  const submit = useSubmit()
  const transition = useTransition()

  console.log({ clientId, appProfile, userProfile, scopeMeta, state })

  const cancelCallback = () => {
    submit(
      {
        cancel: `${appProfile.redirectURI}?=error=access_denied&state=${state}`,
      },
      { method: 'post' }
    )
  }

  const authorizeCallback = async (scopes: string[]) => {
    const form = new FormData()
    form.append('scopes', scopes.join(','))
    form.append('state', state)
    form.append('client_id', clientId)
    form.append('redirect_uri', appProfile.app.redirectURI)
    submit(form, { method: 'post' })
  }

  return (
    <Authorization
      appProfile={appProfile.app}
      userProfile={userProfile}
      scopeMeta={scopeMeta.scopes}
      transition={transition.state}
      cancelCallback={cancelCallback}
      authorizeCallback={authorizeCallback}
    />
  )
}
