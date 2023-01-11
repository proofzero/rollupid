import { useEffect, useRef, useState } from 'react'
import {
  FaBriefcase,
  FaCamera,
  FaEdit,
  FaGlobe,
  FaMapMarkerAlt,
  FaTrash,
} from 'react-icons/fa'

import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  Link,
  Outlet,
  useNavigate,
  useFetcher,
  useLoaderData,
} from '@remix-run/react'

import { AddressURNSpace } from '@kubelt/urns/address'
import type { AccountProfile } from '@kubelt/types/account'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Cover } from '~/components/profile/cover/Cover'
import HeadNav from '~/components/head-nav'
import ConditionalTooltip from '~/components/conditional-tooltip'
import { Links } from '~/components/profile/links'
import { loader as profileLoader } from '~/routes/$profile.json'

import { getUserSession } from '~/utils/session.server'
import { strings, ogImage, clients } from '~/helpers'
import { gatewayFromIpfs } from '@kubelt/utils'
import { getGallery } from '~/helpers/nfts'

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args

  const splittedUrl = request.url.split('/')
  const path = splittedUrl[splittedUrl.length - 1]

  const galaxyClient = await clients.getGalaxyClient()
  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  if (!params.profile) throw new Error('Profile is required')

  const { ensAddress: targetAddress } = await galaxyClient.getEnsAddress({
    addressOrEns: params.profile,
  })

  // get the logged in user profile for the UI
  let loggedInUserProfile = {}
  let isOwner = false
  let profile = null
  let claimed = false
  if (jwt) {
    const profileRes = await galaxyClient.getProfile(undefined, {
      'KBT-Access-JWT-Assertion': jwt,
    })
    profile = profileRes.profile as AccountProfile
    loggedInUserProfile = {
      ...profile,
      claimed: true,
    }
    if (profile.defaultAddress) {
      const urnAddress = AddressURNSpace.decode(profile.defaultAddress)

      isOwner = urnAddress == targetAddress
    }
  }

  // get profile from address if not assigned from logged in user
  if (!isOwner) {
    profile = await (await profileLoader(args)).json()
  } else {
    claimed = true
  }

  const gallery = await getGallery(targetAddress as string)

  // Setup og tag data
  // check generate and return og image
  const cacheKey = await strings.cacheKey(
    `og-image-${targetAddress}-${profile.cover}-${profile.pfp.image}`
  )
  const ogImageURL = await ogImage(profile.cover, profile.pfp.image, cacheKey)

  return json({
    claimed,
    ...profile,
    loggedInUserProfile,
    isOwner,
    targetAddress,
    ogImageURL,
    path,
    isGalleryDisabled: !(gallery && gallery.length > 0),
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
      ? `https://my.threeid.xyz/${targetAddress}`
      : 'https://my.threeid.xyz',
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

const tabs = {
  gallery: 'Gallery',
  collection: 'NFT Collections',
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

const ProfileLayout = () => {
  const {
    loggedInUserProfile,
    targetAddress,
    displayName,
    bio,
    job,
    location,
    isOwner,
    pfp,
    cover,
    website,
    path,
    links,
    isGalleryDisabled,
  } = useLoaderData()
  const { claimed } = loggedInUserProfile
  const [coverUrl, setCoverUrl] = useState(cover)
  const [handlingCover, setHandlingCover] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState<string>(tabs[path])

  const navigate = useNavigate()

  const fetcher = useFetcher()

  useEffect(() => {
    setCurrentTab(tabs[path])
  }, [path])

  // watch for cover load
  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data) {
        setCoverUrl(fetcher.data)
      }

      setHandlingCover(false)
    }
  }, [fetcher])

  // reset cover to original gradient
  // TODO: I think we can dro this
  const deleteCoverImage = async () => {
    setHandlingCover(true)

    fetcher.submit(
      {
        url: '',
      },
      {
        method: 'post',
        action: '/api/update-cover',
      }
    )
  }

  // handle cover upload
  const coverUploadRef = useRef<HTMLInputElement>(null)
  const handleCoverUpload = async (e: any) => {
    setHandlingCover(true)

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

  useEffect(() => {
    if (!coverUrl) {
      return
    }

    setHandlingCover(true)

    const img = new Image()
    img.onload = () => {
      setHandlingCover(false)
    }

    img.src = gatewayFromIpfs(coverUrl) as string
  }, [coverUrl])

  return (
    <div className="bg-white h-full min-h-screen overflow-visible">
      <div
        className="header lg:px-4"
        style={{
          backgroundColor: '#192030',
        }}
      >
        <HeadNav
          loggedIn={
            loggedInUserProfile?.defaultAddress
              ? AddressURNSpace.decode(loggedInUserProfile?.defaultAddress)
              : undefined
          }
          avatarUrl={loggedInUserProfile?.pfp?.image}
          isToken={loggedInUserProfile?.pfp?.isToken}
        />
      </div>

      <Cover
        // loaded={coverUrl && !handlingCover}
        src={gatewayFromIpfs(coverUrl)}
        className={`max-w-7xl mx-auto flex justify-center ${
          !handlingCover ? 'hover-child-visible' : ''
        }`}
      >
        {isOwner && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 flex
          justify-center items-center bg-gray-800/25 rounded-b-xl"
          >
            <input
              ref={coverUploadRef}
              type="file"
              id="pfp-upload"
              name="pfp"
              accept="image/png, image/jpeg"
              className="sr-only"
              onChange={handleCoverUpload}
            />

            {handlingCover && <Spinner color="#ffffff" />}

            {!handlingCover && (
              <div className="flex flex-row space-x-4 items-center">
                <Button
                  btnType={'primary'}
                  btnSize={'sm'}
                  onClick={async () => {
                    await deleteCoverImage()
                  }}
                  className="flex flex-row space-x-3 justify-center items-center"
                  style={{
                    opacity: 0.8,
                  }}
                >
                  <FaTrash className="text-sm" />

                  <Text type="span" size="sm">
                    Delete
                  </Text>
                </Button>

                <Button
                  btnType={'primary'}
                  btnSize={'sm'}
                  onClick={() => {
                    coverUploadRef.current?.click()
                  }}
                  className="flex flex-row space-x-3 justify-center items-center"
                  style={{
                    opacity: 0.8,
                  }}
                >
                  <FaCamera className="text-sm" />

                  <Text type="span" size="sm">
                    Upload
                  </Text>
                </Button>
              </div>
            )}
          </div>
        )}
      </Cover>

      <div
        className="max-w-7xl w-full min-h-[192px] mx-auto flex flex-col
        lg:flex-row justify-center lg:justify-between items-center lg:items-end
        px-8 mt-[-6em]"
      >
        <Avatar
          src={gatewayFromIpfs(pfp.image) as string}
          size="lg"
          hex={pfp.isToken}
          border
        />

        {isOwner && (
          <Link to="/account/settings/profile">
            <Button
              btnSize="sm"
              className="bg-gray-100 flex flex-row space-x-3 items-center justify-center"
              btnType="secondary-alt"
            >
              <span>
                <FaEdit />
              </span>

              <span>Edit Profile</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-3 max-w-[82rem] overflow-visible w-full mx-auto py-3 lg:py-0">
        {!claimed && (
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
                {targetAddress}
              </Text>
            </div>

            <a href="https://passport.threeid.xyz/">
              <Button>Claim This Account</Button>
            </a>
          </div>
        )}

        {claimed && (
          <div className="px-3 lg:px-4">
            <Text
              className="mt-5 mb-2.5 text-gray-800"
              weight="bold"
              size="4xl"
            >
              {displayName ?? strings.shortenedAccount(targetAddress)}
            </Text>

            <div className="flex flex-col space-around">
              <Text
                className="break-normal text-gray-500 mb-12"
                size="base"
                weight="medium"
              >
                {bio}
              </Text>

              <div
                className="flex flex-col lg:flex-row lg:space-x-10 justify-start
              lg:items-center text-gray-500 font-size-lg"
              >
                {location && (
                  <div className="flex flex-row space-x-2 items-center wrap">
                    <FaMapMarkerAlt />
                    <Text weight="medium" className="text-gray-500">
                      {location}
                    </Text>
                  </div>
                )}

                {job && (
                  <div className="flex flex-row space-x-2 items-center">
                    <FaBriefcase />
                    <Text weight="medium" className="text-gray-500">
                      {job}
                    </Text>
                  </div>
                )}

                {website && (
                  <div className="flex flex-row space-x-2 items-center">
                    <FaGlobe />
                    <a href={website} rel="noreferrer" target="_blank">
                      <Text weight="medium" className="text-indigo-500">
                        {website}
                      </Text>
                    </a>
                  </div>
                )}
              </div>
              <Links links={links} />
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="block px-3 lg:px-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {Object.keys(tabs).map((tab) => {
                  return (
                    <ConditionalTooltip
                      key={tabs[tab]}
                      content="Gallery is empty"
                      condition={tab === 'gallery' && isGalleryDisabled}
                    >
                      <button
                        disabled={tab === 'gallery' && isGalleryDisabled}
                        onClick={() => {
                          setCurrentTab(tabs[tab])
                          navigate(`./${tab}`, { replace: true })
                        }}
                        className={classNames(
                          tabs[tab] === currentTab
                            ? 'border-indigo-500 font-semibold text-gray-800'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          '',
                          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                      >
                        {tabs[tab]}
                      </button>
                    </ConditionalTooltip>
                  )
                })}
              </nav>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
