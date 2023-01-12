import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Outlet,
  useCatch,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'

import { FaBriefcase, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'

import { gatewayFromIpfs } from '@kubelt/utils'
import { AddressURNSpace } from '@kubelt/urns/address'
import { Avatar } from '@kubelt/design-system'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Links } from '~/components/profile/links/links'

import { getGalaxyClient } from '~/helpers/clients'
import { ogImage } from '~/helpers'
import { Cover } from '~/components/profile/cover/Cover'
import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'

import defaultOG from '~/assets/3ID_profiles_OG.png'
import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'
import { getAccountAddresses } from '~/helpers/profile'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { handle } = params

  // check if address is registered to an account
  const galaxyClient = await getGalaxyClient()

  // if no profile render /b/eth/<address> page
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN: `${AddressURNSpace.urn(handle as string)}?+addr_type=handle`,
    })
    .then((res) => res.profileFromAddress)
    .catch((err) => {
      // this could return null if the account is invalid
      return null
    })

  if (!profile) {
    console.log("Couldn't resolve handle", { handle })
    throw new Response(
      JSON.stringify({
        // TODO: make proper 404
        ogImage: defaultOG,
        profile,
        errors: [{ code: 404, message: 'Profile could not be resolved' }],
      }),
      { status: 404 }
    )
  }

  let {
    ogImage: og,
    cover,
    pfp,
  } = await ogImage(profile.pfp?.image, handle as string)

  if (!og) {
    og = defaultOG
  }

  const splittedUrl = request.url.split('/')
  const path = splittedUrl[splittedUrl.length - 1]

  return json({
    ogImage: og,
    cover,
    pfp,
    handle,
    path,
    profile,
  })
}

// Wire the loaded profile json, above, to the og meta tags.
export const meta: MetaFunction = ({
  data,
}: {
  data: {
    ogImage: string
    profile?: {
      displayName: string
      handle: string
      bio: string
      location: string
      website: string
      job: string
      links: object[]
    }
  }
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
  if (!data || !data.profile) return meta
  const { profile } = data
  return {
    ...meta,
    'og:title': `${profile.handle}'s 3ID Profile`,
    'twitter:title': `${profile.handle}'s 3ID Profile`,
    'og:url': `https://my.threeid.xyz/u/${profile.handle}`,
    'og:image:alt': `${profile.handle}'s 3ID Profile`,
    'twitter:image:alt': `${profile.handle}'s 3ID Profile`,
  }
}

const HandleProfile = () => {
  const { cover, pfp, profile, path } = useLoaderData()
  const ctx = useOutletContext<object>()

  const navigate = useNavigate()

  return (
    <ProfileLayout
      Cover={<Cover src={gatewayFromIpfs(cover)} />}
      Avatar={
        <Avatar
          src={gatewayFromIpfs(pfp) as string}
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
              {location && (
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
      Tabs={<ProfileTabs path={path} handleTab={navigate} />}
    >
      <Outlet context={{ ...ctx, cover, pfp, profile, path }} />
    </ProfileLayout>
  )
}

export default HandleProfile

export function CatchBoundary() {
  const caught = useCatch()

  console.error('Caught error', { caught })

  let secondary = 'Something went wrong'
  switch (caught.status) {
    case 404:
      secondary = 'Page not found'
      break
  }
  return (
    <div className="grid h-screen place-items-center -mt-20">
      <ErrorPage code={caught.status.toString()} message={secondary} />
    </div>
  )
}
