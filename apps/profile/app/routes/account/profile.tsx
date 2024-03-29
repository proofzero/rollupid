import {
  Form,
  useActionData,
  useOutletContext,
  useTransition,
  useFetcher,
  useSubmit,
} from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa'
import InputText from '~/components/inputs/InputText'
import { getAccessToken, parseJwt } from '~/utils/session.server'
import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'

import { gatewayFromIpfs } from '@proofzero/utils'

import PfpNftModal from '~/components/accounts/PfpNftModal'

import { useEffect, useRef, useState } from 'react'
import type { ActionFunction } from '@remix-run/cloudflare'
import SaveButton from '~/components/accounts/SaveButton'
import { getMoreNftsModal } from '~/helpers/nfts'

import type { FullProfile, NFT } from '~/types'
import { FullProfileSchema } from '~/validation'
import InputTextarea from '@proofzero/design-system/src/atoms/form/InputTextarea'
import createImageClient from '@proofzero/platform-clients/image'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { captureFormSubmitAndReplaceImages } from '@proofzero/design-system/src/utils/form-cf-images'

export const action: ActionFunction = async ({ request, context }) => {
  const { sub: identityURN } = parseJwt(
    await getAccessToken(request, context.env)
  )

  const formData = await request.formData()

  const displayName = formData.get('displayName')?.toString()
  const job = formData.get('job')?.toString()
  const location = formData.get('location')?.toString()
  const bio = formData.get('bio')?.toString()
  const image = formData.get('pfp_url') as string
  let computedIsToken =
    formData.get('pfp_isToken')?.toString() === '1' ? true : false

  const currentProfile = await context.env.ProfileKV.get<FullProfile>(
    identityURN!,
    'json'
  )
  const ogImage = currentProfile?.pfp.image
  const updatedProfile = Object.assign(currentProfile || {}, {
    displayName,
    pfp: {
      image,
      isToken: computedIsToken,
    },
    bio,
    job,
    location,
  })

  const zodValidation = FullProfileSchema.safeParse(updatedProfile)

  if (!zodValidation.success) {
    console.log({ err: JSON.stringify(zodValidation.error) })
    return {
      errors: zodValidation.error.issues[0].message,
    }
  }

  await context.env.ProfileKV.put(
    identityURN!,
    JSON.stringify(zodValidation.data)
  )

  if (ogImage && ogImage !== updatedProfile.pfp.image) {
    const imageClient = createImageClient(context.env.Images, {
      headers: generateTraceContextHeaders(context.traceSpan),
    })

    context.waitUntil(imageClient.delete.mutate(ogImage))
  }

  return null
}

export default function AccountSettingsProfile() {
  const { notify, profile, identityURN } = useOutletContext<{
    profile: FullProfile
    notify: (success: boolean) => void
    identityURN: string
  }>()

  const { displayName, pfp, bio, job, location } = profile

  const [bioInput, setBioInput] = useState(bio || '')

  const [pfpUrl, setPfpUrl] = useState(pfp?.image || undefined)
  const [isToken, setIsToken] = useState<boolean>(false)

  const actionData = useActionData()

  const transition = useTransition()

  useEffect(() => {
    if (transition.type === 'actionReload') {
      if (!actionData?.errors) {
        setFormChanged(false)
      }
      notify(!actionData?.errors)
    }
  }, [actionData?.errors, transition])

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

  const submit = useSubmit()

  // ------------------- START OF MODAL PART ---------------------- //
  // STATE
  const [collection, setCollection] = useState('')

  const modalFetcher = useFetcher()

  // HOOKS

  useEffect(() => {
    const chain =
      collection !== ''
        ? modalFetcher.data?.ownedNfts.filter(
            (nft: NFT) => nft.contract.address === collection
          )[0].chain.chain
        : null
    getMoreNftsModal(modalFetcher, identityURN, collection, chain)
  }, [collection])
  // --------------------- END OF MODAL PART ---------------------- //

  return (
    <>
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        Settings
      </Text>
      <PfpNftModal
        nfts={modalFetcher.data?.ownedNfts}
        collection={collection}
        setCollection={setCollection}
        displayName={displayName as string}
        loadingConditions={modalFetcher.state !== 'idle'}
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

              <Button
                btnType={'secondary'}
                btnSize={'sm'}
                onClick={() => {
                  pfpUploadRef.current?.click()
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
          onSubmitCapture={(event) => {
            captureFormSubmitAndReplaceImages(event, submit, setPfpUploading)
          }}
        >
          <input name="pfp_isToken" type="hidden" value={isToken ? 1 : 0} />
          <input
            ref={pfpUploadRef}
            type="file"
            id={`pfp_file`}
            name={`pfp_file`}
            data-variant="public"
            data-name={'pfp_url'}
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.[0]) {
                setPfpUrl(URL.createObjectURL(event.target.files?.[0]))
                setIsToken(false)
                setFormChanged(true)
              }
            }}
          />

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
          <InputTextarea
            id="bio"
            heading="Bio"
            charLimit={256}
            rows={3}
            value={bioInput}
            onChange={setBioInput}
            error={actionData?.errors.bio}
          />

          {actionData?.errors.bio && (
            <Text className="mb-1.5 text-gray-400" size="xs" weight="normal">
              {actionData.errors.bio}
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
