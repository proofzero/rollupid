import { useEffect, useState } from 'react'
import { LoaderFunction, MetaFunction, redirect } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
} from '@remix-run/react'

import { FaBriefcase, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'

import { getProfileSession } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'
import { ogImageFromProfile } from '~/helpers/ogImage'

import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { gatewayFromIpfs } from '@kubelt/utils'
import { NodeType } from '@kubelt/platform.address/src/types'
import { AddressURNSpace } from '@kubelt/urns/address'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import type { FullProfile, Node, Profile } from '@kubelt/galaxy-client'

import { Cover } from '~/components/profile/cover/Cover'
import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'
import { Links } from '~/components/profile/links/links'

import defaultOG from '~/assets/3ID_profiles_OG.png'
import { getRedirectUrlForProfile } from '~/utils/redirects.server'
import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address, type } = params

  const galaxyClient = await getGalaxyClient()

  const session = await getProfileSession(request)
  if (!address) throw new Error('No address provided in URL')
  const urn = AddressURNSpace.urn(address)

  const profileNotFoundError = json(
    { message: 'Profile could not be resolved' },
    { status: 404 }
  )

  console.debug('PARAMS', type, {
    isProviderKeys:
      Object.values<string>(OAuthAddressType).includes(type as string) ||
      Object.keys(CryptoAddressType).includes(type as string),
    keys: Object.keys(OAuthAddressType),
    values: Object.values<string>(OAuthAddressType).includes(type as string),
    isProviderIncluded: Object.values<string>(OAuthAddressType).includes(
      type as string
    ),
  })
  // if not handle is this let's assume this is an idref
  let fullProfile = undefined
  try {
    console.debug('BEFORE CONST')
    const user = session.get('user')
    let jwt = user?.accessToken

    if (type === 'a') {
      console.log(`Requested /a route. Looking up ${address}...`)
      fullProfile = await galaxyClient
        .getProfileFromAddress(
          {
            addressURN: `${urn}`,
          },
          jwt
            ? {
                [PlatformJWTAssertionHeader]: jwt,
              }
            : {}
        )
        .then((res) => {
          //TODO: this mapping can go away after bug #1513 is resolved
          return {
            profile: res.profileFromAddress,
            links: res.links,
            connectedAddresses: res.connectedAddresses,
            gallery: res.gallery,
          }
        })

      //TODO(betim): remove redirect
      // let redirectUrl = getRedirectUrlForProfile(fullProfile?.profile)
      // const originalRoute = `/${type}/${address}`
      // //Redirect if we've found a better route
      // if (redirectUrl && originalRoute !== redirectUrl)
      //   return redirect(redirectUrl)
      //otherwise stay on current route
    } else if (type === 'u') {
      // TODO: galaxy search by handle
      console.error('Not implemented')
    } else if (
      type &&
      (Object.values<string>(OAuthAddressType).includes(type) ||
        Object.values<string>(CryptoAddressType).includes(type))
    ) {
      console.log(`Requesting /${type} route. Looking up ${address}...`)
      fullProfile = (
        await galaxyClient.getProfileFromAlias({
          alias: address,
          providerType: type,
        })
      ).profileFromAlias
    } else {
      throw profileNotFoundError
    }

    if (!fullProfile || !fullProfile.profile) {
      throw profileNotFoundError
    }

    const ogImage = await ogImageFromProfile(
      fullProfile.profile.pfp?.image as string,
      fullProfile.profile.cover as string
    )

    const splittedUrl = request.url.split('/')
    const path = splittedUrl[splittedUrl.length - 1]

    const cryptoAddresses = fullProfile.connectedAddresses?.filter(
      (addr) => addr.rc.node_type === NodeType.Crypto
    )

    const matches = fullProfile.connectedAddresses?.filter(
      (addr) => urn === addr.urn
    )

    return json({
      profile: fullProfile,
      cryptoAddresses,
      uname: fullProfile.profile.handle || address,
      ogImage: ogImage || defaultOG,
      path,
      isOwner: jwt && matches && matches.length > 0,
    })
  } catch (e) {
    console.log(
      `Galaxy did not return a profile for address ${address}. Moving on.`
    )
    console.debug('ERROR', e)
    throw new Response('No address found', { status: 404 })
  }
}

// Wire the loaded profile json, above, to the og meta tags.
export const meta: MetaFunction = ({
  data,
}: {
  data: { ogImage: string; uname: string }
}) => {
  const meta = {
    'og:title': '3ID Decentralized Profile',
    'twitter:title': '3ID Decentralized Profile',
    'og:description': 'Claim yours now!',
    'twitter:description': 'Claim yours now!',
    'og:url': `https://threeid.xyz`,
    'og:image': data ? data.ogImage : defaultOG,
    'og:image:alt': `Profile not found`,
    'og:site_name': '3ID',
    'og:type': 'profile',
    'twitter:image': data ? data.ogImage : defaultOG,
    'twitter:image:alt': `Profile not found`,
    'twitter:site': '@threeid_xyz',
    'twitter:card': 'summary_large_image',
  }
  if (!data || !data.uname) return meta
  return {
    ...meta,
    'og:title': `${data.uname}'s 3ID Profile`,
    'twitter:title': `${data.uname}'s 3ID Profile`,
    'og:url': `https://my.threeid.xyz/u/${data.uname}`,
    'og:image:alt': `${data.uname}'s 3ID Profile`,
    'twitter:image:alt': `${data.uname}'s 3ID Profile`,
  }
}

const UserAddressLayout = () => {
  //TODO: this needs to be optimized so profile isn't fetched from the loader
  //but used from context alone.
  const { profile, path, cryptoAddresses, isOwner } = useLoaderData<{
    profile: FullProfile
    path: string
    cryptoAddresses: Node[]
    isOwner: boolean
  }>()
  const ctx = useOutletContext<{
    loggedInProfile: Profile | null
    profile: Profile
  }>()
  const finalProfile = profile ?? ctx.profile
  const navigate = useNavigate()
  const fetcher = useFetcher()

  const [coverUrl, setCoverUrl] = useState(
    gatewayFromIpfs(finalProfile.profile?.cover as string)
  )

  useEffect(() => {
    if (fetcher.type === 'done') {
      setCoverUrl(fetcher.data)
    }
  }, [fetcher])

  return (
    <ProfileLayout
      Cover={
        <Cover
          src={coverUrl}
          isOwner={isOwner}
          updateCoverHandler={async (cover: string) => {
            setCoverUrl(cover)
            return fetcher.submit(
              {
                url: cover,
              },
              {
                method: 'post',
                action: '/account/settings/profile/update-cover',
              }
            )
          }}
        />
      }
      Avatar={
        <Avatar
          src={
            gatewayFromIpfs(
              finalProfile.profile?.pfp?.image as string
            ) as string
          }
          size="lg"
          hex={true}
          border
        />
      }
      Claim={
        <div className="px-3 lg:px-4">
          <Text className="mt-5 mb-2.5 text-gray-800" weight="bold" size="4xl">
            {finalProfile.profile?.displayName}
          </Text>

          <div className="flex flex-col space-around">
            <Text
              className="break-normal text-gray-500 mb-12"
              size="base"
              weight="medium"
            >
              {finalProfile.profile?.bio}
            </Text>

            <div
              className="flex flex-col lg:flex-row lg:space-x-10 justify-start
              lg:items-center text-gray-500 font-size-lg"
            >
              {finalProfile.profile?.location && (
                <div className="flex flex-row space-x-2 items-center wrap">
                  <FaMapMarkerAlt />
                  <Text weight="medium" className="text-gray-500">
                    {finalProfile.profile?.location}
                  </Text>
                </div>
              )}

              {finalProfile.profile?.job && (
                <div className="flex flex-row space-x-2 items-center">
                  <FaBriefcase />
                  <Text weight="medium" className="text-gray-500">
                    {finalProfile.profile?.job}
                  </Text>
                </div>
              )}

              {finalProfile.profile?.website && (
                <div className="flex flex-row space-x-2 items-center">
                  <FaGlobe />
                  <a
                    href={finalProfile.profile?.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Text weight="medium" className="text-indigo-500">
                      {finalProfile.profile?.website}
                    </Text>
                  </a>
                </div>
              )}
            </div>
            <Links links={finalProfile.links} />
          </div>
        </div>
      }
      // Claim={
      //   <div
      //     className="rounded-md bg-gray-50 py-4 px-6 flex flex-col lg:flex-row
      //     space-y-4 lg:space-y-0 flex-row justify-between mt-7 px-3 lg:px-4"
      //   >
      //     <div>
      //       <Text className="text-gray-600" size="lg" weight="semibold">
      //         This Account is yet to be claimed - Are you the owner?
      //       </Text>
      //       <Text
      //         className="break-all text-gray-500"
      //         size="base"
      //         weight="normal"
      //       >
      //         {profile.address}
      //       </Text>
      //     </div>

      //     <a href="https://passport.threeid.xyz/">
      //       <Button>Claim This Account</Button>
      //     </a>
      //   </div>
      // }
      Tabs={<ProfileTabs path={path} handleTab={navigate} />}
    >
      <Outlet context={{ ...ctx, finalProfile, path, cryptoAddresses }} />
    </ProfileLayout>
  )
}

export default UserAddressLayout

export function CatchBoundary() {
  //TODO: try getting params injected, as well as useParams below
  //   console.debug('ERROR', error)
  //   const caught = useCatch()
  //   console.debug('CAUGHT', caught)
  //   const { address, type } = useParams()

  return (
    <div>
      <h3>404 page - Replace me with real, provider-specific components</h3>
      <div>
        This account is waiting to be unlocked. Do you own this account?
      </div>
      <div>{/* {type} / {address} */}</div>
    </div>
  )
}
