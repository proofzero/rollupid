import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'

import { getGalaxyClient } from '~/helpers/clients'
import { ogImageFromProfile } from '~/helpers/ogImage'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Cover } from '~/components/profile/cover/Cover'
import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { gatewayFromIpfs } from '@kubelt/utils'
import defaultOG from '~/assets/3ID_profiles_OG.png'
import { NodeType } from '@kubelt/platform.address/src/types'
import { AddressURNSpace } from '@kubelt/urns/address'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address } = params
  const galaxyClient = await getGalaxyClient()

  // first lets check if this address is a valid handle
  // TODO: create a getProfileFromHandle method

  // if not handle is this let's assume this is an idref
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN: `${AddressURNSpace.urn(address as string)}`,
    })
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
    (addr) => addr.rc.nodeType === NodeType.Crypto
  )

  return json({
    profile,
    cryptoAddresses,
    uname: profile.handle || address,
    ogImage: ogImage || defaultOG,
    path,
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
  const { cover, pfp, profile, path, cryptoAddresses } = useLoaderData()
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
        <div
          className="rounded-md bg-gray-50 py-4 px-6 flex flex-col lg:flex-row
          space-y-4 lg:space-y-0 flex-row justify-between mt-7 px-3 lg:px-4"
        >
          <div>
            <Text className="text-gray-600" size="lg" weight="semibold">
              This Account is yet to be claimed - Are you the owner?
            </Text>
            <Text
              className="break-all text-gray-500"
              size="base"
              weight="normal"
            >
              {profile.address}
            </Text>
          </div>

          <a href="https://passport.threeid.xyz/">
            <Button>Claim This Account</Button>
          </a>
        </div>
      }
      Tabs={<ProfileTabs path={path} handleTab={navigate} />}
    >
      <Outlet
        context={{ ...ctx, cover, pfp, profile, path, cryptoAddresses }}
      />
    </ProfileLayout>
  )
}

export default UserAddressLayout
