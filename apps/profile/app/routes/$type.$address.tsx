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

import { JsonError, getErrorCause } from '@proofzero/utils/errors'

import { getAccessToken, parseJwt } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'
import { ogImageFromProfile } from '~/helpers/ogImage'
import { getIdentityProfile } from '~/helpers/profile'

import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'
import { gatewayFromIpfs } from '@proofzero/utils'

import ProfileTabs from '~/components/profile/tabs/tabs'
import ProfileLayout from '~/components/profile/layout'

import defaultOG from '~/assets/social.png'
import subtractLogo from '~/assets/subtract-logo.svg'
import { CryptoAccountType, OAuthAccountType } from '@proofzero/types/account'
import type { IdentityURN } from '@proofzero/urns/identity'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { Button, Text } from '@proofzero/design-system'
import { imageFromAccountType } from '~/helpers'
import type { FullProfile } from '~/types'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const loader: LoaderFunction = async ({ request, params, context }) => {
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

  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(context.traceSpan),
    context.env
  )
  if (!address) throw new Error('No address provided in URL')
  if (!type) throw new Error('No provider specified in URL')

  // redirect from any accountURN to its accountURNs
  let identityURN: IdentityURN
  if (type !== 'p') {
    try {
      const { identityFromAlias } = await galaxyClient.getIdentityURNFromAlias({
        provider: type,
        alias: address,
      })

      if (!identityFromAlias) {
        throw json({ message: 'Not Found' }, { status: 404 })
      }

      identityURN = identityFromAlias as IdentityURN
    } catch (error) {
      throw JsonError(error, context.traceSpan.getTraceParent())
    }
  } else {
    identityURN = IdentityURNSpace.urn(address) as IdentityURN
  }

  // if not handle is this let's assume this is an idref
  let profile, jwt
  try {
    jwt = await getAccessToken(request, context.env)

    profile = await getIdentityProfile(
      { jwt, identityURN },
      context.env,
      context.traceSpan
    )

    if (!profile) {
      throw json({ message: 'Profile could not be resolved' }, { status: 404 })
    }

    let ogImage = null
    if (request.cf.botManagement.score < 30) {
      ogImage = await ogImageFromProfile(
        profile.pfp?.image as string,
        context.env,
        context.traceSpan
      )
    } else {
      console.debug(
        'Human detected, not generating OG image',
        request.cf.botManagement.score
      )
    }

    const splittedUrl = request.url.split('/')
    const path = splittedUrl[splittedUrl.length - 1]

    // Check if the identityURN in jwt matches with identityURN in URL
    const isOwner = jwt ? parseJwt(jwt).sub === identityURN : false

    return json({
      uname: profile.displayName || address,
      ogImage: ogImage || defaultOG,
      profile,
      identityURN,
      path,
      isOwner,
    })
  } catch (error) {
    console.log(
      `Galaxy did not return a profile for address ${identityURN}. Moving on.`
    )
    console.error(getErrorCause(error))
    throw new Response('No address found', { status: 404 })
  }
}

// Wire the loaded profile json, above, to the og meta tags.
export const meta: MetaFunction = ({
  data,
}: {
  data: { ogImage: string; uname: string; profile: FullProfile }
}) => {
  const desc =
    data && data.profile && data.profile.bio
      ? data.profile.bio
      : 'Claim yours now!'
  const meta = {
    'og:title': 'Rollup Decentralized Profile',
    'twitter:title': 'Rollup Decentralized Profile',
    'og:description': desc,
    'twitter:description': desc,
    'og:url': `https://rollup.id`,
    'og:image:alt': `Profile not found`,
    'og:site_name': 'Rollup',
    'og:type': 'profile',
    'twitter:image:alt': `Profile not found`,
    'twitter:site': '@rollupid',
    'twitter:card': 'summary_large_image',
  }
  if (!data || !data.uname) return meta
  return {
    ...meta,
    'og:image': data.ogImage,
    'twitter:image': data.ogImage,
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
  const { profile, path, isOwner, identityURN } = useLoaderData<{
    profile: FullProfile
    path: string
    isOwner: boolean
    identityURN: string
  }>()

  const finalProfile = profile

  const navigate = useNavigate()

  return (
    <ProfileLayout
      Avatar={
        <Avatar
          src={gatewayFromIpfs(finalProfile.pfp?.image as string) as string}
          size="lg"
          hex={finalProfile.pfp?.isToken as boolean}
          border
        />
      }
      Claim={
        <div className="px-3 lg:px-4">
          <Text
            className="mb-5 text-gray-800 text-center"
            weight="bold"
            size="4xl"
          >
            {finalProfile.displayName}
          </Text>

          <div className="flex flex-col justify-center items-center">
            {finalProfile.bio && (
              <Text
                className="break-normal text-gray-500 mb-5 text-center w-full"
                size="base"
                weight="normal"
              >
                {finalProfile.bio}
              </Text>
            )}
            <div
              className="flex flex-col space-x-0 space-y-5 justify-between w-[70%]
              lg:justify-center lg:w-full lg:flex-row lg:space-x-10 lg:space-y-0
              items-center text-gray-500 font-size-lg "
            >
              {finalProfile.location && (
                <div className="flex flex-row space-x-3 items-center">
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
      PoweredBy={
        <div className="mb-7 flex justify-center items-center space-x-2">
          <img src={subtractLogo} alt="powered by rollup.id" />
          <Text size="xs" weight="normal" className="text-gray-400">
            Powered by{' '}
            <a
              href="https://rollup.id"
              className="hover:underline text-indigo-500"
            >
              rollup.id
            </a>
          </Text>
        </div>
      }
      Tabs={<ProfileTabs path={path} handleTab={navigate} />}
    >
      <Outlet
        context={{
          identityURN,
          profile: finalProfile,
          isOwner,
        }}
      />
    </ProfileLayout>
  )
}

export default UserAddressLayout

export function CatchBoundary() {
  const caught = useCatch()
  console.error('Caught in $type/$address catch boundary', { caught })

  const { address, type } = useParams()
  const icon = imageFromAccountType(type as string)

  let providerCopy
  switch (type) {
    case CryptoAccountType.ETH:
      providerCopy = 'with Wallet'
      break
    case OAuthAccountType.Apple:
      providerCopy = 'with Apple'
      break
    case OAuthAccountType.GitHub:
      providerCopy = 'with GitHub'
      break
    case OAuthAccountType.Google:
      providerCopy = 'with Google'
      break
    case OAuthAccountType.Microsoft:
      providerCopy = 'with Microsoft'
      break
    case OAuthAccountType.Twitter:
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
