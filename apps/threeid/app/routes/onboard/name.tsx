import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
  PrefetchPageLinks,
} from '@remix-run/react'
import { Label, TextInput, Spinner } from 'flowbite-react'

import { useEffect, useState } from 'react'
import { Button, ButtonSize } from '~/components/buttons'

import Heading from '~/components/typography/Heading'
import { Text } from '@kubelt/design-system'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import { Visibility } from '~/utils/galaxy.server'
import { oortSend } from '~/utils/rpc.server'
import { getUserSession, requireJWT } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const address = session.get('address')
  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  let profile = profileRes.profile || { displayName: '' }

  if (!profileRes.profile?.displayName) {
    const addressLookup = await oortSend('ens_lookupAddress', [address], {
      jwt,
    })

    if (addressLookup?.result?.endsWith('.eth')) {
      const ensRes = await fetch(
        `https://api.ensideas.com/ens/resolve/${addressLookup?.result}`
      )
      const res: {
        displayName: string | null
      } = await ensRes.json()

      profile.displayName = res.displayName || addressLookup?.result
    }
  }

  return json(profile)
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const address = session.get('address')

  const form = await request.formData()
  const displayname = form.get('displayname')

  const errors: {
    profile?: string
    displayname?: string
  } = {}

  if (typeof displayname !== 'string' || displayname === '') {
    errors.displayname = 'Display Name needs to be provided'
  }

  const galaxyClient = await getGalaxyClient()
  // PUT new object
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName: displayname?.toString(),
      },
      visibility: Visibility.Public,
    },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )

  if (Object.keys(errors).length) {
    return json(errors, { status: 422 })
  }

  // @ts-ignore
  return redirect(`/onboard/mint`)
}

const OnboardDisplayname = () => {
  const profile = useLoaderData()

  const [displayname, setDisplayname] = useState(profile?.displayName || '')

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.type === 'init') {
      fetcher.load(`/onboard/mint/load-voucher`)
    }
  }, [fetcher])

  const actionErrors = useActionData()
  const transition = useTransition()

  return (
    <>
      <ol role="list" className="mx-auto flex items-center space-x-5">
        <li>
          <a
            href={'/onboard/name'}
            className="relative flex items-center justify-center"
            aria-current="step"
          >
            <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span className="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span
              className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600"
              aria-hidden="true"
            />
            <span className="sr-only">{'Display Name'}</span>
          </a>
        </li>

        <li>
          <a
            href="/onboard/mint"
            className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400"
          >
            <span className="sr-only">{'Mint'}</span>
          </a>
        </li>
      </ol>

      <Heading className="flex flex-1 text-center justify-center items-center">
        What should we call you?
      </Heading>

      <Form
        method="post"
        className="flex flex-1 flex-col justify-center items-center"
      >
        <section
          id="onboard-displayname-form"
          className="flex-1 justify-center items-center items-stretch self-center"
        >
          <Label htmlFor="display-name">
            <Text
              className="mb-1.5 text-gray-700"
              size="sm"
              weight="medium"
            >
              *Display Name
            </Text>

            {actionErrors?.displayname && (
              <Text
                className="mb-1.5 text-gray-400"
                size="xs"
                weight="normal"
              >
                {actionErrors.displayname}
              </Text>
            )}
          </Label>

          <TextInput
            id="displayname"
            name="displayname"
            type="text"
            placeholder="Ash"
            autoFocus={true}
            required={true}
            onChange={(event) => setDisplayname(event.target.value)}
            value={displayname}
            helperText={
              <Text
                type="span"
                className="mt-2 text-gray-400"
                size="xs"
                weight="normal"
              >
                You can always change this later in the settings
              </Text>
            }
          />
        </section>

        <section
          id="onboard-displayname-actions"
          className="flex flex-1 justify-end w-full items-end space-x-4 pt-10 lg:pt-0"
        >
          {transition.state === 'submitting' ||
          transition.state === 'loading' ? (
            <Spinner />
          ) : (
            <Button
              isSubmit={true}
              disabled={!displayname || displayname === ''}
              size={ButtonSize.L}
            >
              Continue
            </Button>
          )}
        </section>
      </Form>
      <PrefetchPageLinks page="/onboard/mint" />
    </>
  )
}

export default OnboardDisplayname
