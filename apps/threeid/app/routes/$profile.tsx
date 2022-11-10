import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useCatch,
  useFetcher,
  useLoaderData,
} from '@remix-run/react'

import ProfileCard from '~/components/profile/ProfileCard'

import { loader as profileLoader } from '~/routes/$profile.json'
import { getUserSession } from '~/utils/session.server'

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { Button, ButtonSize, ButtonType } from '~/components/buttons'

import HeadNav from '~/components/head-nav'

import { links as spinnerLinks } from '~/components/spinner'
import { links as nftCollLinks } from '~/components/nft-collection/ProfileNftCollection'

import ProfileNftCollection from '~/components/nft-collection/ProfileNftCollection'
import { FaBriefcase, FaCamera, FaEdit, FaMapMarkerAlt } from 'react-icons/fa'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import ButtonLink from '~/components/buttons/ButtonLink'
import { useEffect, useRef, useState } from 'react'

import social from '~/assets/social.png'
import pepe from '~/assets/pepe.svg'

import { oortSend } from '~/utils/rpc.server'
import { getGalaxyClient } from '~/helpers/galaxyClient'

export function links() {
  return [...spinnerLinks(), ...nftCollLinks()]
}

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args

  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  const address = session.get('address')

  let targetAddress = params.profile

  // get the logged in user profile for the UI
  let loggedInUserProfile = {}
  if (jwt) {
    const galaxyClient = await getGalaxyClient()
    const profileRes = await galaxyClient.getProfile(undefined, {
      'KBT-Access-JWT-Assertion': jwt,
    })
    loggedInUserProfile = {
      ...profileRes.profile,
      claimed: true,
    }

    if (params.address?.endsWith('.eth')) {
      // get the 0x address for the eth name
      const addressLookup = await oortSend('ens_lookupAddress', [address], {
        jwt,
      })

      // the ens name is the same as the logged in user
      if (addressLookup?.result == params.address) {
        targetAddress = address
      }
    } else if (address == params.address) {
      targetAddress = address
    }
  }

  let profileJson = {}
  let isOwner = false
  if (address !== targetAddress) {
    const profileJsonRes = await profileLoader(args)
    if (profileJsonRes.status !== 200) {
      const resData = {
        error: await profileJsonRes.text(),
        targetAddress: params.profile,
        displayName: null,
        bio: null,
        loggedInUserProfile,
        ogImageUrl: social,
        loggedIn: jwt ? { address } : false,
      }
      throw json(resData, { status: profileJsonRes.status as number })
    }
    profileJson = await profileJsonRes.json()
  } else {
    profileJson = loggedInUserProfile
    isOwner = true
  }

  // Setup og tag data
  let hex = gatewayFromIpfs(profileJson?.pfp?.image)
  let bkg = gatewayFromIpfs(profileJson?.cover)

  // check generate and return og image
  const ogImage = await fetch(`${NFTAR_URL}/v0/og-image`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${NFTAR_AUTHORIZATION}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      bkg,
      hex,
    }),
  })

  let url
  try {
    url = (await ogImage.json()).url
  } catch {
    console.error(
      'JSON converstion failed for og:image generator. Using default social image.'
    )
    url = social
  }
  return json({
    ...profileJson,
    loggedInUserProfile,
    isOwner,
    targetAddress: targetAddress,
    loggedIn: jwt ? { address } : false,
    ogImageURL: url,
  })
}

// Wire the loaded profile json, above, to the og meta tags.
export const meta: MetaFunction = ({
  data: { targetAddress, displayName, bio, ogImageURL, twitterHandle } = {},
}) => {
  const title =
    displayName || targetAddress
      ? `${displayName || targetAddress}'s 3ID Profile`
      : '3ID Decentralized Profile'
  return {
    'og:title': title,
    'twitter:title': title,
    'og:description': bio || 'Claim yours now!',
    'twitter:description': bio || 'Claim yours now!',
    'og:url': targetAddress
      ? `https://3id.kubelt.com/${targetAddress}`
      : 'https://3id.kubelt.com',
    'og:image': ogImageURL + `?${Date.now()}`,
    'og:image:alt': `${displayName || targetAddress}'s 3ID Profile`,
    'og:site_name': '3ID',
    'og:type': 'profile',
    // Twitter-specific meta tags.
    // See: https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started
    'twitter:image': ogImageURL + `?${Date.now()}`,
    'twitter:image:alt': `${displayName || targetAddress}'s 3ID Profile`,
    'twitter:site': '@threeid_xyz',
    'twitter:card': 'summary_large_image',
    // TODO: Hook this up
    // 'twitter:creator': twitterHandle || '@threeid_xyz',
  }
}

const ProfileRoute = () => {
  const {
    loggedInUserProfile,
    targetAddress,
    claimed,
    displayName,
    bio,
    job,
    location,
    isOwner,
    loggedIn,
    pfp,
    cover,
    website,
  } = useLoaderData()

  const [coverUrl, setCoverUrl] = useState(cover)

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data) {
        setCoverUrl(fetcher.data)
      }
    }
  }, [fetcher])

  const coverUploadRef = useRef<HTMLInputElement>(null)
  const handleCoverUpload = async (e: any) => {
    const coverFile = (e.target as HTMLInputElement & EventTarget).files?.item(
      0
    )
    if (!coverFile) {
      return
    }

    const formData = new FormData()
    formData.append('file', coverFile)

    const imgUploadUrl = (await fetch('/api/image-upload-url', {
      method: 'post',
    }).then((res) => res.json())) as string

    const cfUploadRes: {
      success: boolean
      result: {
        variants: string[]
      }
    } = await fetch(imgUploadUrl, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())

    const publicVariantUrls = cfUploadRes.result.variants.filter((v) =>
      v.endsWith('public')
    )

    if (publicVariantUrls.length) {
      fetcher.submit(
        {
          url: publicVariantUrls[0],
        },
        {
          method: 'post',
          action: '/api/update-cover',
        }
      )
    }
  }

  const isWindow = typeof window != 'undefined'

  return (
    <div className="bg-white h-full min-h-screen">
      <div
        className="header lg:px-4"
        style={{
          backgroundColor: '#192030',
        }}
      >
        <HeadNav
          loggedIn={loggedIn}
          avatarUrl={loggedInUserProfile?.pfp?.image}
          isToken={loggedInUserProfile?.pfp?.isToken}
        />
      </div>

      <div
        className="h-80 w-full relative flex justify-center p-3"
        style={{
          backgroundImage: coverUrl
            ? `url(${gatewayFromIpfs(coverUrl)})`
            : undefined,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="mt-[6.5rem] lg:mt-28 max-w-7xl w-full mx-auto justify-center lg:justify-start flex">
          <div className="absolute">
            <ProfileCard
              account={targetAddress}
              avatarUrl={gatewayFromIpfs(pfp?.image)}
              claimed={claimed ? new Date() : undefined}
              displayName={displayName}
              isNft={pfp?.isToken}
              webUrl={website}
            />
          </div>
        </div>

        {isOwner && (
          <div className="absolute top-0 lg:top-auto lg:bottom-0 right-0 my-8 mx-6">
            <input
              ref={coverUploadRef}
              type="file"
              id="pfp-upload"
              name="pfp"
              accept="image/png, image/jpeg"
              className="sr-only"
              onChange={handleCoverUpload}
            />

            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.SM}
              Icon={FaCamera}
              onClick={() => {
                coverUploadRef.current?.click()
              }}
            >
              Edit cover photo
            </Button>
          </div>
        )}
      </div>

      <div className="p-3 mt-44 lg:mt-0 max-w-7xl w-full mx-auto">
        {!claimed && (
          <div className="lg:ml-[19rem] rounded-md bg-gray-50 py-4 px-6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 flex-row justify-between mt-7">
            <div>
              <Text
                size={TextSize.LG}
                weight={TextWeight.SemiBold600}
                color={TextColor.Gray600}
              >
                This Account is yet to be claimed - Are you the owner?
              </Text>
              <Text
                className="break-all"
                size={TextSize.Base}
                weight={TextWeight.Regular400}
                color={TextColor.Gray500}
              >
                {targetAddress}
              </Text>
            </div>

            <a href="https://get.threeid.xyz/">
              <Button>Claim This Account</Button>
            </a>
          </div>
        )}

        {claimed && (
          <div
            className="lg:ml-[19rem] py-4 px-6"
            style={{
              minHeight: '8rem',
            }}
          >
            <Text
              className="break-all"
              size={TextSize.Base}
              weight={TextWeight.Medium500}
              color={TextColor.Gray500}
            >
              {bio}
            </Text>

            <hr className="my-6" />

            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-row space-x-10 justify-start items-center text-gray-500 font-size-lg">
                {location && (
                  <div className="flex flex-row space-x-3.5 justify-center items-center wrap">
                    <FaMapMarkerAlt /> <Text>{location}</Text>
                  </div>
                )}

                {job && (
                  <div className="flex flex-row space-x-4 justify-center items-center">
                    <FaBriefcase /> <Text>{job}</Text>
                  </div>
                )}
              </div>

              {isOwner && (
                <ButtonLink
                  size={ButtonSize.SM}
                  to="/account/settings/profile"
                  Icon={FaEdit}
                >
                  Edit Profile
                </ButtonLink>
              )}
            </div>
          </div>
        )}

        <div className="mt-20">
          <Text
            className="pb-4"
            size={TextSize.SM}
            weight={TextWeight.SemiBold600}
            color={TextColor.Gray600}
          >
            NFT Collection
          </Text>

          <ProfileNftCollection
            account={targetAddress}
            displayname={displayName}
            isOwner={isOwner}
            detailsModal
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileRoute

export function CatchBoundary() {
  const caught = useCatch()

  let secondary = 'Something went wrong'
  switch (caught.status) {
    case 404:
      secondary = 'Page not found'
      break
    case 400:
      secondary = 'Invalid address'
      break
    case 500:
      secondary = 'Internal Server Error'
      break
  }
  return (
    <div className="error-screen bg-white h-full min-h-screen">
      <div
        style={{
          backgroundColor: '#192030',
        }}
      >
        <HeadNav
          loggedIn={caught.data.loggedIn}
          avatarUrl={caught.data.loggedInUserProfile?.pfp?.image}
          isToken={caught.data.loggedInUserProfile?.pfp?.isToken}
        />
      </div>
      <div
        className="wrapper grid grid-row-3 gap-4"
        style={{ marginTop: '-128px' }}
      >
        <article className="content col-span-3">
          <div className="error justify-center items-center">
            <p className="error-message text-center">{caught.status}</p>
            <p className="error-secondary-message text-center">{secondary}</p>
          </div>
          <div className="relative">
            <img alt="pepe" className="m-auto pb-12" src={pepe} />
          </div>
        </article>
      </div>
    </div>
  )
}
