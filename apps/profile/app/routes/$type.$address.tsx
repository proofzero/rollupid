import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import {
  Outlet,
  useCatch,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'

import { HiOutlineMapPin } from 'react-icons/hi2'
import {
  HiOutlineBriefcase,
  HiOutlineLockClosed,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi'
import { TiEdit } from 'react-icons/ti'

import { getProfileSession, parseJwt } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'
import { ogImageFromProfile } from '~/helpers/ogImage'

import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import {
  gatewayFromIpfs,
  getAuthzHeaderConditionallyFromToken,
} from '@kubelt/utils'
import { AddressURNSpace } from '@kubelt/urns/address'

import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'

import defaultOG from '~/assets/social.png'
import {
  CryptoAddressType,
  NodeType,
  OAuthAddressType,
} from '@kubelt/types/address'
import type { AccountURN } from '@kubelt/urns/account'
import { AccountURNSpace } from '@kubelt/urns/account'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { imageFromAddressType } from '~/helpers'
import type { FullProfile } from '~/types'

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url)
  const { address, type } = params

  /**
   * If we don't redirect here
   * we will load loader -> then go to /$type/$address/index
   * -> then will redirect to /links and call this same
   * loader second time
   */
  if (url.pathname === `/${type}/${address}`) {
    return redirect(`/${type}/${address}/links`)
  }

  const galaxyClient = await getGalaxyClient()

  const session = await getProfileSession(request)
  if (!address) throw new Error('No address provided in URL')

  // redirect from any addressURN to its addressURNs
  if (type === 'a') {
    const { account }: { account: AccountURN } =
      await galaxyClient.getAccountUrnFromAddress({
        addressURN: AddressURNSpace.urn(address),
      })

    return redirect(`/p/${AccountURNSpace.decode(account)}`)
  }

  const accountURN = AccountURNSpace.urn(address) as AccountURN

  // if not handle is this let's assume this is an idref
  let profile, jwt
  try {
    const user = session.get('user')
    jwt = user?.accessToken
    profile = await galaxyClient.getProfile(
      {
        targetAccountURN: accountURN,
      },
      getAuthzHeaderConditionallyFromToken(jwt)
    )

    if (!profile) {
      throw json({ message: 'Profile could not be resolved' }, { status: 404 })
    }

    profile = {
      ...profile.profile,
      links: profile.links || [],
      gallery: profile.gallery || [],
      addresses: profile.connectedAddresses || [],
    }

    if (type === 'u') {
      //TODO: galaxy search by handle
      console.error('Not implemented')
    } else {
      //TODO: Type-based resolvers to be tackled in separate PR
    }

    let ogImage = null
    if (request.cf.botManagement.score < 30) {
      ogImage = await ogImageFromProfile(profile.pfp?.image as string)
    } else {
      console.debug(
        'Human detected, not generating OG image',
        request.cf.botManagement.score
      )
    }

    const splittedUrl = request.url.split('/')
    const path = splittedUrl[splittedUrl.length - 1]

    // Check if the accountURN in jwt matches with accountURN in URL
    const isOwner = jwt ? parseJwt(jwt).sub === accountURN : false

    const cryptoAddresses = profile.addresses?.filter(
      (addr) => addr.rc.node_type === NodeType.Crypto
    )

    return json({
      uname: profile.displayName || address,
      ogImage: ogImage || defaultOG,
      profile,
      accountURN,
      cryptoAddresses,
      path,
      isOwner,
    })
  } catch (e) {
    console.log(
      `Galaxy did not return a profile for address ${accountURN}. Moving on.`
    )
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
    'og:title': 'Rollup Decentralized Profile',
    'twitter:title': 'Rollup Decentralized Profile',
    'og:description': 'Claim yours now!',
    'twitter:description': 'Claim yours now!',
    'og:url': `https://rollup.id`,
    'og:image': data.ogImage,
    'og:image:alt': `Profile not found`,
    'og:site_name': 'Rollup',
    'og:type': 'profile',
    'twitter:image': data.ogImage,
    'twitter:image:alt': `Profile not found`,
    'twitter:site': '@rollupid',
    'twitter:card': 'summary_large_image',
  }
  if (!data || !data.uname) return meta
  return {
    ...meta,
    'og:title': `${data.uname}'s Rollup Profile`,
    'twitter:title': `${data.uname}'s Rollup Profile`,
    'og:url': `https://my.rollup.id/u/${data.uname}`,
    'og:image:alt': `${data.uname}'s Rollup Profile`,
    'twitter:image:alt': `${data.uname}'s Rollup Profile`,
  }
}

const UserAddressLayout = () => {
  //TODO: this needs to be optimized so profile isn't fetched from the loader
  //but used from context alone.
  const { profile, cryptoAddresses, path, isOwner, accountURN } =
    useLoaderData<{
      profile: FullProfile
      cryptoAddresses: Node[]
      path: string
      isOwner: boolean
      accountURN: string
    }>()

  const finalProfile = profile

  const navigate = useNavigate()

  return (
    <ProfileLayout
      Avatar={
        <Avatar
          src={gatewayFromIpfs(finalProfile.pfp?.image as string) as string}
          size="lg"
          hex={true}
          border
        />
      }
      Edit={
        <Button
          btnType="secondary-alt"
          btnSize="base"
          className="text-gray-500 max-w-max max-h-[40px] 
          flex justify-center items-center
        "
          onClick={() => {
            navigate('/account/profile')
          }}
        >
          <div className="flex items-center justify-center">
            <TiEdit size={22} className="mr-2" />
            Edit Profile
          </div>
        </Button>
      }
      Claim={
        <div className="px-3 lg:px-4">
          <Text
            className="mt-5 mb-5 text-gray-800 text-center"
            weight="bold"
            size="4xl"
          >
            {finalProfile.displayName}
          </Text>

          <div className="flex flex-col justify-center items-center">
            <Text
              className="break-normal text-gray-500 mb-12 text-center"
              size="base"
              weight="normal"
            >
              {finalProfile.bio}
            </Text>

            <div
              className="flex flex-row justify-between lg:justify-center lg:space-x-10
              w-[70%] lg:w-full items-center text-gray-500 font-size-lg"
            >
              {finalProfile.location && (
                <div className="flex flex-row space-x-3 items-center wrap">
                  <HiOutlineMapPin className="h-5 w-5" />
                  <Text weight="medium" className="text-gray-500">
                    {finalProfile.location}
                  </Text>
                </div>
              )}

              {finalProfile.job && (
                <div className="flex flex-row space-x-3 items-center">
                  <HiOutlineBriefcase className="h-5 w-5" />
                  <Text weight="medium" className="text-gray-500">
                    {finalProfile.job}
                  </Text>
                </div>
              )}
            </div>
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

      //     <a href="https://passport.rollup.id/">
      //       <Button>Claim This Account</Button>
      //     </a>
      //   </div>
      // }
      Tabs={<ProfileTabs path={path} handleTab={navigate} />}
    >
      <Outlet
        context={{
          accountURN,
          profile: finalProfile,
          cryptoAddresses,
          isOwner,
        }}
      />
    </ProfileLayout>
  )
}

export default UserAddressLayout

export const CatchBoundary = () => {
  const caught = useCatch()
  console.error('Caught in catch boundary', { caught })

  const { address, type } = useParams()
  const icon = imageFromAddressType(type as string)

  let providerCopy
  switch (type) {
    case CryptoAddressType.ETH:
      providerCopy = 'with Wallet'
      break
    case OAuthAddressType.Apple:
      providerCopy = 'with Apple'
      break
    case OAuthAddressType.GitHub:
      providerCopy = 'with GitHub'
      break
    case OAuthAddressType.Google:
      providerCopy = 'with Google'
      break
    case OAuthAddressType.Microsoft:
      providerCopy = 'with Microsoft'
      break
    case OAuthAddressType.Twitter:
      providerCopy = 'with Twitter'
      break
  }

  return (
    <>
      <div className="max-w-4xl mx-auto h-48 relative rounded-b-xl bg-gray-100 flex justify-center items-center">
        <HiOutlineLockClosed className="text-gray-200 w-32 h-32" />

        <div className="absolute max-w-4xl w-full mx-auto flex justify-center items-center top-3/4">
          <div className="rounded-full bg-white overflow-hidden flex justify-center items-center w-24 h-24">
            {!icon && <HiOutlineQuestionMarkCircle className="w-16 h-16" />}
            {icon && (
              <img src={icon} className="w-16 h-16" alt="address icon" />
            )}
          </div>
        </div>
      </div>

      <Text
        className="mt-16 text-center"
        size="3xl"
        weight="bold"
      >{`${address?.substring(0, 4)}...${address?.substring(
        address.length - 4
      )}`}</Text>

      <div className="mt-8 max-w-4xl mx-auto rounded-xl bg-gray-100 flex justify-between items-center py-5 px-8">
        <div>
          <Text size="xl" weight="semibold" className="text-gray-800 mb-1.5">
            This Account is yet to be unlocked
          </Text>
          <Text size="sm" weight="medium" className="text-gray-600">
            Do you own this account?
          </Text>
        </div>

        <Button btnSize="xl">Login {providerCopy}</Button>
      </div>
    </>
  )
}
