import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { FaAt, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa'
import { Button, ButtonSize, ButtonType } from '~/components/buttons'
import InputText from '~/components/inputs/InputText'
import { requireJWT } from '~/utils/session.server'
import { Visibility } from '~/utils/galaxy.server'

import InputTextarea from '~/components/inputs/InputTextarea'
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/galaxyClient'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  return json({
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
  const { displayName, job, location, bio, website, pfp } = useLoaderData()

  const actionData = useActionData()

  return (
    <>
      <div className="flex flex-col space-y-9 mt-12">
        <div className="flex flex-row space-x-10">
          <img
            src={gatewayFromIpfs(pfp.image)}
            style={{
              width: 118,
              height: 118,
            }}
            className="rounded-full"
          />

          <div className="flex flex-col justify-between">
            <div className="flex flex-row space-x-3.5">
              <Button type={ButtonType.Secondary} size={ButtonSize.SM} disabled>
                Change NFT Avatar
              </Button>
              <Button type={ButtonType.Secondary} size={ButtonSize.SM} disabled>
                Upload an Image
              </Button>
            </div>

            <div className="flex flex-col space-y-2.5">
              <Text
                size={TextSize.SM}
                weight={TextWeight.Medium500}
                color={TextColor.Gray400}
              >
                Or use your 1/1 gradient
              </Text>

              <img
                src={gatewayFromIpfs(pfp.image)}
                style={{
                  width: 33,
                  height: 33,
                }}
                className="rounded-md"
              />
            </div>
          </div>
        </div>

        <Form className="flex flex-col space-y-9 mt-12" method="post">
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
