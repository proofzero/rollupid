import { useEffect, useState } from 'react'
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'

import { FaBriefcase, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'

import { getUserSession } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'
import { ogImageFromProfile } from '~/helpers/ogImage'

import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { gatewayFromIpfs } from '@kubelt/utils'
import { NodeType } from '@kubelt/platform.address/src/types'
import { AddressURNSpace } from '@kubelt/urns/address'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import type { Node, Profile } from '@kubelt/galaxy-client'

import { Cover } from '~/components/profile/cover/Cover'
import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'
import { Links } from '~/components/profile/links/links'

import defaultOG from '~/assets/3ID_profiles_OG.png'

export const loader: LoaderFunction = async ({ request, params }) => {
  const address = params.address as string

  const galaxyClient = await getGalaxyClient()

  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  const urn = AddressURNSpace.urn(address)

  // first lets check if this address is a valid handle
  // TODO: create a getProfileFromHandle method

  // if not handle is this let's assume this is an idref
  const profile = await galaxyClient
    .getProfileFromAddress(
      {
        addressURN: `${urn}`,
      },
      {
        [PlatformJWTAssertionHeader]: jwt,
      }
    )
    .then((res) => res.profileFromAddress)
    .catch((err) => {
      console.debug({ err })
      // this could return null if the address is not linked to an account
      // or the account is linked and marked as private
      // or if the account is invalid
      return null
    })

  if (!profile) {
    throw json({ message: 'Profile could not be resolved' }, { status: 404 })
  }

  const ogImage = await ogImageFromProfile(
    profile.pfp?.image as string,
    profile.cover as string
  )

  const splittedUrl = request.url.split('/')
  const path = splittedUrl[splittedUrl.length - 1]

  const cryptoAddresses = profile.addresses?.filter(
    (addr) => addr.rc.node_type === NodeType.Crypto
  )

  const matches = profile.addresses?.filter((addr) => urn === addr.urn)

  return json({
    profile,
    cryptoAddresses,
    uname: profile.handle || address,
    ogImage: ogImage || defaultOG,
    path,
    isOwner: matches && matches.length > 0,
  })
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
  const { profile, path, cryptoAddresses, isOwner } = useLoaderData<{
    profile: Profile
    path: string
    cryptoAddresses: Node[]
    isOwner: boolean
  }>()
  const ctx = useOutletContext<{
    loggedInProfile: Profile | null
  }>()

  const navigate = useNavigate()
  const fetcher = useFetcher()

  const [coverUrl, setCoverUrl] = useState(
    gatewayFromIpfs(profile.cover as string)
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
          src={gatewayFromIpfs(profile.pfp?.image as string) as string}
          size="lg"
          hex={true}
          border
        />
      }
      Claim={
        <div className="px-3 lg:px-4">
          <Text className="mt-5 mb-2.5 text-gray-800" weight="bold" size="4xl">
            {profile.displayName}
          </Text>

          <div className="flex flex-col space-around">
            <Text
              className="break-normal text-gray-500 mb-12"
              size="base"
              weight="medium"
            >
              {profile.bio}
            </Text>

            <div
              className="flex flex-col lg:flex-row lg:space-x-10 justify-start
              lg:items-center text-gray-500 font-size-lg"
            >
              {profile.location && (
                <div className="flex flex-row space-x-2 items-center wrap">
                  <FaMapMarkerAlt />
                  <Text weight="medium" className="text-gray-500">
                    {profile.location}
                  </Text>
                </div>
              )}

              {profile.job && (
                <div className="flex flex-row space-x-2 items-center">
                  <FaBriefcase />
                  <Text weight="medium" className="text-gray-500">
                    {profile.job}
                  </Text>
                </div>
              )}

              {profile.website && (
                <div className="flex flex-row space-x-2 items-center">
                  <FaGlobe />
                  <a href={profile.website} rel="noreferrer" target="_blank">
                    <Text weight="medium" className="text-indigo-500">
                      {profile.website}
                    </Text>
                  </a>
                </div>
              )}
            </div>
            <Links links={profile.links} />
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
      <Outlet context={{ ...ctx, profile, path, cryptoAddresses }} />
    </ProfileLayout>
  )
}

export default UserAddressLayout
