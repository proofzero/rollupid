import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData } from '@remix-run/react'

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

export function links() {
  return [...spinnerLinks(), ...nftCollLinks()]
}

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args

  const profileJson = await profileLoader(args).then((profileRes: Response) =>
    profileRes.json()
  )

  let isOwner = false

  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  const address = session.get('address')

  if (address === params.profile) {
    isOwner = true
  }

  return json({
    ...profileJson,
    isOwner,
    targetAddress: params.profile,
    loggedIn: jwt ? { address } : false,
  })
}

const ProfileRoute = () => {
  const {
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

  return (
    <div className="bg-white h-full min-h-screen">
      <div
        className="lg:px-4"
        style={{
          backgroundColor: '#192030',
        }}
      >
        <HeadNav
          loggedIn={loggedIn}
          avatarUrl={pfp.image}
          isToken={pfp.isToken}
        />
      </div>

      <div
        className="h-80 w-full relative flex justify-center"
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
              avatarUrl={gatewayFromIpfs(pfp.image)}
              claimed={claimed ? new Date() : undefined}
              displayName={displayName}
              isNft={pfp.isToken}
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

      <div className="mt-44 lg:mt-0 max-w-7xl w-full mx-auto">
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
