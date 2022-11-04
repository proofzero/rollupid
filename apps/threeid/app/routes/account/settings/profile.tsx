import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
  useTransition,
} from '@remix-run/react'
import { FaAt, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa'
import { Button, ButtonSize, ButtonType } from '~/components/buttons'
import InputText from '~/components/inputs/InputText'
import { getUserSession, requireJWT } from '~/utils/session.server'
import { Visibility } from '~/utils/galaxy.server'

import InputTextarea from '~/components/inputs/InputTextarea'
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/galaxyClient'

import PfpNftModal from '~/components/accounts/settings/PfpNftModal'
import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { getCachedVoucher } from '~/helpers/voucher'

import { links as spinnerLinks } from '~/components/spinner'
import Spinner from '~/components/spinner'

export function links() {
  return [...spinnerLinks()]
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const address = await session.get('address')

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  let voucher
  try {
    voucher = await getCachedVoucher(address)
  } catch (ex) {
    console.error(ex)
  }

  return json({
    address,
    generatedPfp: voucher?.metadata?.image,
    generatedPfpMinted: voucher?.minted,
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

  const bio = formData.get('bio')?.toString()
  if (bio && bio.length > 256) {
    errors.bio = ['Bio must be less than 256 characters']
  }

  if (Object.keys(errors).length) {
    return {
      errors,
    }
  }

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName: displayName,
        job: formData.get('job')?.toString(),
        location: formData.get('location')?.toString(),
        bio: bio,
        website: formData.get('website')?.toString(),
        pfp: {
          image: formData.get('pfp_url') as string,
          isToken: !!!formData.get('pfp_isToken'),
        },
      },
      visibility: Visibility.Public,
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

  const [pfpUrl, setPfpUrl] = useState(pfp.image)
  const [isToken, setIsToken] = useState(pfp.isToken)

  const actionData = useActionData()

  const transition = useTransition()
  useEffect(() => {
    if (transition.type === 'actionReload') {
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

  const handlePfpUpload = async (e: any) => {
    const pfpFile = (e.target as HTMLInputElement & EventTarget).files?.item(0)
    if (!pfpFile) {
      return
    }

    const formData = new FormData()
    formData.append('file', pfpFile)

    setPfpUploading(true)

    // Get upload URL
    // TODO: Replace with service binding
    // QUESTION: Should this be in BFF? I think so
    const cfUploadUrlRes: {
      id: string
      uploadURL: string
    } = await fetch('https://icons.kubelt.com').then((res) => res.json())

    // QUESTION: Should this be in BFF? I think so
    const cfUploadRes = (await fetch(cfUploadUrlRes.uploadURL, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())) as {
      success: boolean
      result: {
        variants: string[]
      }
    }

    setPfpUploading(false)

    if (!cfUploadRes.success) {
      throw new Error('Error uploading PFP')
    }

    const publicVariantUrl = cfUploadRes.result.variants.filter((v) =>
      v.endsWith('public')
    )[0]

    setPfpUrl(publicVariantUrl)
    setIsToken(false)
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
        <div className="flex flex-row space-x-10">
          {!pfpUploading && !isToken && (
            <img
              src={gatewayFromIpfs(pfpUrl)}
              className="rounded-full w-[118px] h-[118px]"
            />
          )}

          {!pfpUploading && isToken && (
            <div
              style={{
                clipPath:
                  'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
                boxShadow: 'inset 0px 10px 100px 10px white',
                transform: 'scale(1.2)',
              }}
            >
              <img
                className="w-[118px] h-[118px]"
                src={gatewayFromIpfs(pfpUrl)}
              />
            </div>
          )}

          {pfpUploading && (
            <div className="flex justify-center items-center w-[118px] h-[118px]">
              <Spinner />
            </div>
          )}

          <div className="flex flex-col justify-between">
            <div className="flex flex-row space-x-3.5">
              <Button
                type={ButtonType.Secondary}
                size={ButtonSize.SM}
                onClick={() => {
                  if (!nftPfpModalOpen) setNftPfpModalOpen(true)
                }}
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
                type={ButtonType.Secondary}
                size={ButtonSize.SM}
                onClick={() => {
                  pfpUploadRef.current?.click()
                }}
              >
                Upload an Image
              </Button>
            </div>

            {generatedPfp && (
              <div className="flex flex-col space-y-2.5">
                <Text
                  size={TextSize.SM}
                  weight={TextWeight.Medium500}
                  color={TextColor.Gray400}
                >
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

        <Form className="flex flex-col space-y-9 mt-12" method="post">
          <input name="pfp_url" type="hidden" value={pfpUrl} />
          <input name="pfp_isToken" type="hidden" value={isToken} />

          <InputText
            id="displayName"
            heading="Display Name"
            placeholder="Your Display Name"
            Icon={FaAt}
            defaultValue={displayName}
            required={true}
            error={actionData?.errors.displayName}
          />

          {actionData?.errors.displayName && (
            <Text
              className="mb-1.5"
              size={TextSize.XS}
              weight={TextWeight.Regular400}
              color={TextColor.Gray400}
            >
              {actionData.errors.displayName}
            </Text>
          )}

          <div className="flex flex-col lg:flex-row lg:space-x-9">
            <div className="flex-1">
              <InputText
                id="job"
                heading="Job"
                placeholder="Your Job"
                Icon={FaBriefcase}
                defaultValue={job}
              />
            </div>

            <div className="flex-1">
              <InputText
                id="location"
                heading="Location"
                placeholder="Your Location"
                Icon={FaMapMarkerAlt}
                defaultValue={location}
              />
            </div>
          </div>

          <InputText
            id="website"
            heading="Website"
            addon="http://"
            defaultValue={website}
          />

          <InputTextarea
            id="bio"
            heading="Bio"
            charLimit={256}
            rows={3}
            defaultValue={bio}
            error={actionData?.errors.bio}
          />

          {actionData?.errors.bio && (
            <Text
              className="mb-1.5"
              size={TextSize.XS}
              weight={TextWeight.Regular400}
              color={TextColor.Gray400}
            >
              {actionData?.errors.bio}
            </Text>
          )}

          <div className="flex lg:justify-end">
            <Button isSubmit type={ButtonType.Primary}>
              Save
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}
