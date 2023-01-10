import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit } from '@remix-run/react'

import { ResponseType } from '@kubelt/platform.access/src/types'

import {
  getAccessClient,
  getAddressClient,
  getGalaxyClient,
  getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession, parseJwt, requireJWT } from '~/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import type { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'
import type { AddressURN } from '@kubelt/urns/address'
import { NodeType } from '@kubelt/platform/address/src/types'
import type { CryptoAddressProfile, OAuthGoogleProfile } from '@kubelt/platform/address/src/types'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')

  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const defaultProfileURN = session.get('defaultProfileUrn') as AddressURN

  const parsedURN = AddressURNSpace.parse(defaultProfileURN)
  const rparams = new URLSearchParams(parsedURN.rcomponent || '')

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfileFromAddress(
    { addressURN: defaultProfileURN },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )
  const profile = profileRes.profileFromAddress

  if (!profile) {
    const addressClient = getAddressClient(defaultProfileURN)
    const addressProfile = await addressClient.getAddressProfile.query()

    if (rparams.get('node_type') == NodeType.Crypto) {
      const voucher = addressClient.getVoucher.query()
      const cryptoAddressProfile = addressProfile as CryptoAddressProfile
      await galaxyClient.updateProfile(
        {
          profile: {
            defaultAddress: defaultProfileURN,
            displayName: cryptoAddressProfile.displayName,
            pfp: {
              image: cryptoAddressProfile.avatar || '',
            },
            cover: voucher.metadata?.cover,
          },
        },
        {
          [PlatformJWTAssertionHeader]: jwt,
        }
      )
    } else if (rparams.get('node_type') == NodeType.OAuth) {
      const { profile: accountProfile } = await galaxyClient.getProfile({}, {
        [PlatformJWTAssertionHeader]: jwt,
      })

      if (!accountProfile) {
        const vaultAddressURN = await addressClient.initVault.mutate()
        const vaultAddressClient = getAddressClient(vaultAddressURN)
        const voucher = await vaultAddressClient.getVoucher.query()
        const oauthAddressProfile = addressProfile as OAuthGoogleProfile
        await galaxyClient.updateProfile(
          {
            profile: {
              defaultAddress: defaultProfileURN,
              displayName: oauthAddressProfile.name,
              pfp: {
                image: oauthAddressProfile.picture,
              },
              cover: voucher.metadata?.cover,
            },
          },
          {
            [PlatformJWTAssertionHeader]: jwt,
          }
        )
      }
    }
  }

  // if no client id let's redirect to the first party app select page
  if (!client_id) {
    return redirect('/apps')
  }

  try {
    const sbClient = getStarbaseClient(jwt)

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
    form.append('redirect_uri', appProfile.redirectURI)
    submit(form, { method: 'post' })
  }

  return (
    <Authorization
      appProfile={appProfile}
      userProfile={userProfile}
      scopeMeta={scopeMeta.scopes}
      cancelCallback={cancelCallback}
      authorizeCallback={authorizeCallback}
    />
  )
}
