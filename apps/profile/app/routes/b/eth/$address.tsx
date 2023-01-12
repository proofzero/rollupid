import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'

import { gatewayFromIpfs } from '@kubelt/utils'
import { Avatar } from '@kubelt/design-system'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { CryptoAddressProfile } from '@kubelt/platform.address/src/types'
import { AddressURNSpace } from '@kubelt/urns/address'

import { getGalaxyClient } from '~/helpers/clients'
import { ogImage } from '~/helpers'
import { Cover } from '~/components/profile/cover/Cover'
import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'

import defaultOG from '~/assets/3ID_profiles_OG.png'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address } = params

  // check if address is registered to an account
  const galaxyClient = await getGalaxyClient()

  // if no profile render /b/eth/<address> page
  const [addressProfile] = await Promise.all([
    galaxyClient
      .getAddressProfile({
        addressURN: `${AddressURNSpace.urn(
          address as string
        )}?+addr_type=eth?=addr=${address as string}`,
      })
      .then((res) => res.addressProfile as CryptoAddressProfile)
      .catch((err) => {
        return {
          address: null,
          avatar: null,
          displayName: null,
        }
      }),
  ])

  if (!addressProfile.address) {
    throw new Response(
      JSON.stringify({
        ogImage: defaultOG,
        errors: [{ code: 400, message: 'Profile could not be resolved' }],
      }),
      { status: 400 }
    )
  }

  let {
    ogImage: genOgImage,
    cover,
    pfp,
  } = await ogImage(addressProfile.avatar, addressProfile.address)

  const splittedUrl = request.url.split('/')
  const path = splittedUrl[splittedUrl.length - 1]

  return json({
    ogImage: genOgImage || defaultOG,
    cover,
    pfp,
    address,
    path,
    profile: addressProfile,
  })
}

// Wire the loaded profile json, above, to the og meta tags.
export const meta: MetaFunction = ({
  data,
}: {
  data: { ogImage: string; profile?: { displayName: string; address: string } }
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
    'og:title': `${profile.displayName || profile.address}'s 3ID Profile`,
    'twitter:title': `${profile.displayName || profile.address}'s 3ID Profile`,
    'og:url': `https://my.threeid.xyz/b/eth/${profile.address}`,
    'og:image:alt': `${profile.displayName || profile.address}'s 3ID Profile`,
    'twitter:image:alt': `${
      profile.displayName || profile.address
    }'s 3ID Profile`,
  }
}

const EthAddress = () => {
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
      <Outlet context={{ ...ctx, cover, pfp, profile, path }} />
    </ProfileLayout>
  )
}

export default EthAddress
