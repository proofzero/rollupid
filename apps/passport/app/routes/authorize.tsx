import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'
import type { AddressURN } from '@kubelt/urns/address'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getAddressClient, getGalaxyClient } from '~/platform.server'
import { getUserSession, requireJWT } from '~/session.server'
import { generateGradient } from '~/utils/gradient.server'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request, context.consoleParams, context.env)
  const session = await getUserSession(request, false, context.env)
  const defaultProfileURN = session.get('defaultProfileUrn') as AddressURN

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(
    {},
    getAuthzHeaderConditionallyFromToken(jwt)
  )
  const profile = profileRes.profile

  if (!profile) {
    console.log("Profile doesn't exist, creating one...")
    const addressClient = getAddressClient(defaultProfileURN, context.env)
    const newProfile = await addressClient.getAddressProfile
      .query()
      .then(async (res) => {
        switch (res.type) {
          case CryptoAddressType.ETH: {
            const gradient = await generateGradient(
              res.profile.address,
              context.env
            )
            return {
              displayName: res.profile.displayName || res.profile.address,
              pfp: {
                image: res.profile.avatar || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.GitHub: {
            const gradient = await generateGradient(
              res.profile.login,
              context.env
            )
            return {
              displayName: res.profile.name || res.profile.login,
              pfp: {
                image: res.profile.avatar_url || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Google: {
            const gradient = await generateGradient(
              res.profile.email,
              context.env
            )
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.picture,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Twitter: {
            const gradient = await generateGradient(
              res.profile.id.toString(),
              context.env
            )
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.profile_image_url_https,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Microsoft: {
            const gradient = await generateGradient(
              res.profile.sub.toString(),
              context.env
            )
            return {
              displayName: res.profile.name,
              pfp: {
                //Cached profile image
                image: res.profile.rollupidImageUrl as string,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Apple: {
            const gradient = await generateGradient(
              res.profile.sub.toString(),
              context.env
            )
            const { firstName, lastName } = res.profile.name
            return {
              cover: gradient,
              displayName: `${firstName} ${lastName}`,
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
      getAuthzHeaderConditionallyFromToken(jwt)
    )
  }

  return json({ profile })
}

export default function Authorize() {
  const { profile } = useLoaderData()
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        style={{
          backgroundImage: `url(https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/918fa1e6-d9c2-40d3-15cf-63131a2d8400/public)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className={'basis-2/5 h-screen w-full hidden lg:block'}
      ></div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Outlet context={{ profile }} />
      </div>
    </div>
  )
}
