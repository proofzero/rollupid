import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
  useTransition,
} from '@remix-run/react'
import { FaAt, FaBriefcase, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import InputText from '~/components/inputs/InputText'
import { requireJWT } from '~/utils/session.server'

import InputTextarea from '~/components/inputs/InputTextarea'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient, getCryptoAddressClient } from '~/helpers/clients'

import PfpNftModal from '~/components/accounts/settings/PfpNftModal'
import { useEffect, useRef, useState } from 'react'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { parseURN } from 'urns'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  console.log({ profileRes })

  const parsedURN = parseURN(profileRes.profile?.defaultAddress)

  const address = parsedURN.nss.split('/')[1]

  const { nftsForAddress } = await galaxyClient.getNftsForAddress({
    owner: address,
    contractAddresses: [MINTPFP_CONTRACT_ADDRESS],
  })

  const addressClient = getCryptoAddressClient({
    headers: {
      'X-3RN': `urn:threeid:address/${address}`,
    },
  })
  const voucher = await addressClient.kb_getPfpVoucher()

  return json({
    address,
    generatedPfp: voucher?.metadata?.image,
    generatedPfpMinted: nftsForAddress.ownedNfts.length,
    ...profileRes.profile,
  })
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  let errors: any = {}

  const displayName = formData.get('displayName')?.toString()
  if (!displayName || displayName === '') {
    errors.displayName = ['Display name is required']
  }

  if (displayName && displayName.length > 50) {
    errors.displayName = ['Display name is maximum 50 characters']
  }

  const job = formData.get('job')?.toString()
  if (job && job.length > 30) {
    errors.job = ['Job is maximum 30 characters']
  }

  const location = formData.get('location')?.toString()
  if (location && location.length > 30) {
    errors.location = ['Location is maximum 30 characters']
  }

  const website = formData.get('website')?.toString()
  if (website) {
    let url
    try {
      // URL throws exception
      // if website is invalid
      url = new URL(website)
    } catch (ex) {
      errors.website = ['Website must be a valid URL']
    }
  }

  const bio = formData.get('bio')?.toString()
  if (bio && bio.length > 256) {
    errors.bio = ['Bio must be less than 256 characters']
  }

  if (Object.keys(errors).length) {
    return {
      errors,
    }
  }

  let computedIsToken =
    formData.get('pfp_isToken')?.toString() === '1' ? true : false

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName: displayName,
        // TODO: support for default address
        job: job,
        location: location,
        bio: bio,
        website: formData.get('website')?.toString(),
        pfp: {
          image: formData.get('pfp_url') as string,
          isToken: computedIsToken,
        },
      },
    },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )

  return null
}

export default function AccountSettingsProfile() {
  const { notificationHandler } = useOutletContext<any>()

  const {
    displayName,
    job,
    location,
    bio,
    website,
    pfp,
    address,
    generatedPfp,
    generatedPfpMinted,
  } = useLoaderData()

  const [pfpUrl, setPfpUrl] = useState(pfp?.image)
  const [isToken, setIsToken] = useState<boolean>(pfp?.isToken ?? false)

  const actionData = useActionData()

  const transition = useTransition()
  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notificationHandler(!!!actionData?.errors)
    }
  }, [transition])

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

    const imgUploadUrl = (await fetch('/api/image-upload-url', {
      method: 'post',
    }).then((res) => res.json())) as string

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

  return (
    <>
      <PfpNftModal
        account={address}
        isOpen={nftPfpModalOpen}
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
                }}
                className="!text-gray-600 border-none"
              >
                Upload an Image
              </Button>
            </div>

            {generatedPfp && (
              <div className="flex flex-col space-y-2.5 items-center lg:items-start">
                <Text className="text-gray-400" size="sm" weight="medium">
                  Or use your 1/1 gradient
                </Text>

                <img
                  src={gatewayFromIpfs(generatedPfp)}
                  style={{
                    width: 33,
                    height: 33,
                  }}
                  className="rounded-md cursor-pointer"
                  onClick={() => {
                    setPfpUrl(generatedPfp)
                    setIsToken(generatedPfpMinted)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <Form
          className="flex flex-col space-y-9 mt-12"
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
              defaultValue={displayName}
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
                defaultValue={job}
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
                defaultValue={location}
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
            defaultValue={website}
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
            defaultValue={bio}
            error={actionData?.errors.bio}
          />

          {actionData?.errors.bio && (
            <Text className="mb-1.5 text-gray-400" size="xs" weight="normal">
              {actionData?.errors.bio}
            </Text>
          )}
          {isFormChanged ? (
            <div className="flex lg:justify-end">
              <div className="pr-2">
                <Button
                  type="reset"
                  btnType={'secondary'}
                  btnSize={'xl'}
                  className="!text-gray-600 border-none mb-4 lg:mb-0"
                >
                  Discard
                </Button>
              </div>
              <Button
                isSubmit
                btnType={'primary'}
                btnSize={'xl'}
                className="mb-4 lg:mb-0"
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex lg:justify-end">
              <Button
                isSubmit
                btnType={'primary'}
                btnSize={'xl'}
                className="mb-4 lg:mb-0"
                disabled
              >
                Save
              </Button>
            </div>
          )}
        </Form>
      </div>
    </>
  )
}
