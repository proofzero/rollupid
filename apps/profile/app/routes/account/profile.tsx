import {
  Form,
  useActionData,
  useOutletContext,
  useTransition,
  useFetcher,
} from '@remix-run/react'
import { FaBriefcase, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import InputText from '~/components/inputs/InputText'
import { requireJWT } from '~/utils/session.server'
import InputTextarea from '~/components/inputs/InputTextarea'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import {
  gatewayFromIpfs,
  getAuthzHeaderConditionallyFromToken,
} from '@kubelt/utils'

import PfpNftModal from '~/components/accounts/PfpNftModal'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import SaveButton from '~/components/accounts/SaveButton'
import { getGalaxyClient } from '~/helpers/clients'
import { getMoreNftsModal } from '~/helpers/nfts'
import type { Node, Profile } from '@kubelt/galaxy-client'

export const loader: LoaderFunction = async ({ request }) => {
  await requireJWT(request)
  return null
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const displayName = formData.get('displayName')?.toString()
  const job = formData.get('job')?.toString()
  const location = formData.get('location')?.toString()
  const website = formData.get('website')?.toString()
  const bio = formData.get('bio')?.toString()
  const image = formData.get('pfp_url') as string
  let computedIsToken =
    formData.get('pfp_isToken')?.toString() === '1' ? true : false
  const galaxyClient = await getGalaxyClient()

  // TODO: handle and return form errors
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName,
        // TODO: support for default address
        job,
        location,
        bio,
        website,
        pfp: {
          image,
          isToken: computedIsToken,
        },
      },
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return null
}

export default function AccountSettingsProfile() {
  const { notificationHandler, profile, accountURN } = useOutletContext<{
    profile: Profile
    notificationHandler: (success: boolean) => void
    accountURN: string
  }>()

  //TODO: update pfp components to take multiple addresses

  const {
    displayName,
    job,
    location,
    bio,
    website,
    pfp,
    // address,
    // generatedPfp,
    // generatedPfpMinted,
  } = profile

  const [pfpUrl, setPfpUrl] = useState(pfp?.image || undefined)
  const [isToken, setIsToken] = useState<boolean>(false)

  const actionData = useActionData()

  const transition = useTransition()
  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notificationHandler(!actionData?.errors)
    }
  }, [actionData?.errors, notificationHandler, transition])

  const [nftPfpModalOpen, setNftPfpModalOpen] = useState(false)

  const handlePfpModalClose = (val: boolean) => {
    setNftPfpModalOpen(val)
  }

  const handleSelectedNft = (nft: any) => {
    setPfpUrl(nft.url)
    setIsToken(true)
    setNftPfpModalOpen(false)
  }

  const pfpUploadRef = useRef<HTMLInputElement>(null)
  const [pfpUploading, setPfpUploading] = useState(false)
  const [isFormChanged, setFormChanged] = useState(false)

  const handlePfpUpload = async (e: any) => {
    const pfpFile = (e.target as HTMLInputElement & EventTarget).files?.item(0)
    if (!pfpFile) {
      return
    }

    setPfpUploading(true)

    const imgUploadUrl = (await fetch('/account/profile/image-upload-url', {
      method: 'post',
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e)
      })) as string

    const formData = new FormData()
    formData.append('file', pfpFile)

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
      setPfpUrl(publicVariantUrls[0])
      setIsToken(false)
    }

    setPfpUploading(false)
  }

  // ------------------- START OF MODAL PART ---------------------- //
  // STATE
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [collection, setCollection] = useState('')

  const modalFetcher = useFetcher()

  // HOOKS
  useEffect(() => {
    if (modalFetcher.data) {
      /* We already have only 1 NFT per collection
       ** No need to put it in additional set
       */

      setLoadedNfts(modalFetcher.data.ownedNfts)
      setPageLink(modalFetcher.data.pageKey ?? null)

      if (refresh) {
        setRefresh(false)
      }
    }
  }, [modalFetcher.data])

  useEffect(() => {
    getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
  }, [collection])

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useMemo(() => {
    setRefresh(true)
    setLoadedNfts([])
    setPageLink(undefined)
  }, [])

  useEffect(() => {
    const asyncFn = async () => {
      getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
    }
    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  // --------------------- END OF MODAL PART ---------------------- //

  return (
    <>
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        Settings
      </Text>
      <PfpNftModal
        nfts={loadedNfts}
        collection={collection}
        setCollection={setCollection}
        displayName={displayName as string}
        loadingConditions={refresh || loading || modalFetcher.state !== 'idle'}
        text={'Select NFT Avatar'}
        isOpen={nftPfpModalOpen}
        pfp={pfpUrl as string}
        handleClose={handlePfpModalClose}
        handleSelectedNft={handleSelectedNft}
      />

      <div className="flex flex-col space-y-9 mt-12">
        <div className="flex flex-col lg:flex-row items-center space-x-0 lg:space-x-10 space-y-9 lg:space-y-0">
          {!pfpUploading && (
            <Avatar
              src={gatewayFromIpfs(pfpUrl) as string}
              size="md"
              hex={isToken}
            />
          )}

          {pfpUploading && (
            <div className="flex justify-center items-center w-40 h-40">
              <Spinner />
            </div>
          )}

          <div className="flex flex-col justify-between space-y-3.5">
            <div className="flex flex-row space-x-3.5">
              <Button
                btnType={'secondary'}
                btnSize={'sm'}
                onClick={() => {
                  if (!nftPfpModalOpen) setNftPfpModalOpen(true)
                  setFormChanged(true)
                }}
                className="!text-gray-600 border-none"
              >
                Change NFT Avatar
              </Button>

              <input
                ref={pfpUploadRef}
                type="file"
                id="pfp-upload"
                name="pfp"
                accept="image/png, image/jpeg"
                className="sr-only"
                onChange={handlePfpUpload}
              />

              <Button
                btnType={'secondary'}
                btnSize={'sm'}
                onClick={() => {
                  pfpUploadRef.current?.click()
                  setFormChanged(true)
                }}
                className="!text-gray-600 border-none"
              >
                Upload an Image
              </Button>
            </div>
          </div>
        </div>

        <Form
          className="flex flex-col space-y-9 mt-12 relative"
          method="post"
          onChange={() => {
            setFormChanged(true)
          }}
          onReset={() => {
            setFormChanged(false)
          }}
        >
          <input name="pfp_url" type="hidden" value={pfpUrl} />
          <input name="pfp_isToken" type="hidden" value={isToken ? 1 : 0} />

          <div className="lg:w-3/6 lg:pr-4">
            <InputText
              id="displayName"
              heading="Display Name *"
              placeholder="Your Display Name"
              defaultValue={displayName || ''}
              required={true}
              error={actionData?.errors.displayName}
              maxChars={50}
            />
          </div>

          {actionData?.errors.displayName && (
            <Text className="mb-1.5 text-gray-400" size="xs" weight="normal">
              {actionData.errors.displayName}
            </Text>
          )}

          <div className="flex flex-col lg:flex-row lg:space-x-9">
            <div className="flex-1 mb-4 lg:mb-0">
              <InputText
                id="job"
                heading="Job"
                placeholder="Your Job"
                Icon={FaBriefcase}
                defaultValue={job || ''}
                maxChars={30}
              />

              {actionData?.errors.job && (
                <Text
                  className="mb-1.5 text-gray-400"
                  size="xs"
                  weight="normal"
                >
                  {actionData.errors.job}
                </Text>
              )}
            </div>

            <div className="flex-1">
              <InputText
                id="location"
                heading="Location"
                placeholder="Your Location"
                Icon={FaMapMarkerAlt}
                defaultValue={location || ''}
                maxChars={30}
              />

              {actionData?.errors.location && (
                <Text
                  className="mb-1.5 text-gray-400"
                  size="xs"
                  weight="normal"
                >
                  {actionData.errors.location}
                </Text>
              )}
            </div>
          </div>

          <InputText
            type="url"
            id="website"
            heading="Website"
            Icon={FaGlobe}
            defaultValue={website || ''}
            error={actionData?.errors?.website}
          />

          {actionData?.errors?.website && (
            <Text className="mb-1.5 text-gray-400" size="xs" weight="normal">
              {actionData.errors.website}
            </Text>
          )}

          <InputTextarea
            id="bio"
            heading="Bio"
            charLimit={256}
            rows={3}
            defaultValue={bio || ''}
            error={actionData?.errors.bio}
          />

          {actionData?.errors.bio && (
            <Text className="mb-1.5 text-gray-400" size="xs" weight="normal">
              {actionData?.errors.bio}
            </Text>
          )}

          {/* Form where this button is used should have 
          an absolute relative position
          div below has relative - this way this button sticks to 
          bottom right

          This div with h-[4rem] prevents everything from overlapping with
          div with absolute position below  */}
          <div className="h-[4rem]" />
          <div className="absolute bottom-0 right-0">
            <SaveButton
              isFormChanged={isFormChanged}
              discardFn={() => setPfpUrl(pfp?.image || undefined)}
            />
          </div>
        </Form>
      </div>
    </>
  )
}
