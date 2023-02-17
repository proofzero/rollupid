import { useState, useEffect } from 'react'
import qs from 'qs'
import {
  Form,
  useTransition,
  useOutletContext,
  useActionData,
  useLoaderData,
  useFetcher,
} from '@remix-run/react'

import { requireJWT } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'

import { HiOutlineTrash } from 'react-icons/hi'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'
import { AiOutlinePlus } from 'react-icons/ai'

import type { AddressProfile, Link } from '@kubelt/galaxy-client'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { SortableList } from '@kubelt/design-system/src/atoms/lists/SortableList'

import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import type { AddressURN } from '@kubelt/urns/address'

import { InputToggle } from '@kubelt/design-system/src/atoms/form/InputToggle'
import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'
import { imageFromAddressType } from '~/helpers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { FullProfile } from '~/types'

/**
 * Prepares Crypto and OAuth profiles
 * to be displayed in generic sortable list;
 * Adds additional properties that are used
 * for filtering when posting data to the server.
 */
const normalizeAddressProfile = (ap: AddressProfile) => {
  switch (ap.profile.__typename) {
    case 'CryptoAddressProfile':
      return {
        addressURN: ap.urn,
        // Some providers can be built on client side
        address: `https://etherscan.io/address/${ap.profile.address}`,
        title: ap.profile.displayName,
        icon: imageFromAddressType(CryptoAddressType.ETH),
        provider: CryptoAddressType.ETH,
      }
    case 'OAuthGoogleProfile':
      return {
        addressURN: ap.urn,
        // Some providers don't have an address
        // and are thus unlinkable
        address: '',
        title: 'Google',
        icon: imageFromAddressType(OAuthAddressType.Google),
        provider: OAuthAddressType.Google,
      }
    case 'OAuthTwitterProfile':
      return {
        addressURN: ap.urn,
        address: `https://twitter.com/${profile.screen_name}`,
        title: 'Twitter',
        icon: ap.profile.profile_image_url_https,
        provider: OAuthAddressType.Twitter,
      }
    case 'OAuthGithubProfile':
      return {
        addressURN: ap.urn,
        // Some providers give us public
        // endpoints
        address: ap.profile.html_url,
        title: 'GitHub',
        icon: imageFromAddressType(OAuthAddressType.GitHub),
        provider: OAuthAddressType.GitHub,
      }
    case 'OAuthMicrosoftProfile':
      return {
        addressURN: ap.urn,
        address: '',
        title: 'Microsoft',
        icon: imageFromAddressType(OAuthAddressType.Microsoft),
        provider: OAuthAddressType.Microsoft,
      }
    case 'OAuthAppleProfile':
      return {
        addressURN: ap.urn,
        address: '',
        title: 'Apple',
        icon: imageFromAddressType(OAuthAddressType.Apple),
        provider: OAuthAddressType.Apple,
      }
    case 'OAuthDiscordProfile':
      return {
        addressURN: ap.urn,
        address: '',
        title: 'Discord',
        icon: imageFromAddressType(OAuthAddressType.Discord),
        provider: OAuthAddressType.Discord,
      }
  }
}

// This entire loader is a good target for deferring once added
export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  // We go through this because
  // the context had connected addresses
  // but don't have the profiles
  // and it's complex to send them to a loader / action
  const addresses = (await getAccountAddresses(jwt)) ?? []

  // We get the full profiles
  const profiles =
    (await getAddressProfiles(
      jwt,
      addresses.map((atu) => atu.urn as AddressURN)
    )) ?? []

  // We need to get them ready to be displayed
  // in the generic Sortable List
  const normalizedAddressProfiles = profiles.map(normalizeAddressProfile)

  return {
    normalizedAddressProfiles,
  }
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formDataText = await request.text()
  const formData = qs.parse(formDataText)

  /**
   * Updated names and urls are fetched from inputText
   * And separately I created hidden input for previous unchanged links
   * to not forget to include them on profile too
   */
  const updatedLinks = (formData['links'] || []) as Link[]

  // TODO: Add validation

  const errors: {
    [key: string | number]: { name?: string; url?: string }
  } = {}

  updatedLinks.forEach((link: any, id: number) => {
    /** This is the way
     * I attach new props to an empty object
     */

    if (!link.name) {
      errors[`${id}`] = {}
      errors[`${id}`].name = 'All links must have name'
    }
    if (!link.url) {
      if (!errors[`${id}`]) errors[`${id}`] = {}
      errors[`${id}`].url = 'All links must have URL'
    }
  })

  if (Object.keys(errors).length) {
    return { errors }
  }
  const galaxyClient = await getGalaxyClient()

  await galaxyClient.updateLinks(
    {
      // Links get displayed parsed from this
      // so order matters. In order to get connected
      // links to be first; we add them first.
      links: updatedLinks,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return { updatedLinks }
}

const SortableLink = ({
  id,
  link: { name, url, editing = false },
  error,
  setFormChanged,
  deleteLink,
}: {
  id: string
  link: Link & { editing?: boolean }
  error: any
  setFormChanged: (value: boolean) => void
  deleteLink: (id: string) => void
}) => {
  const [isEditing, setEditing] = useState(editing)
  const [nameInput, setNameInput] = useState(name || '')
  const [urlInput, setUrlInput] = useState(url || '')

  if (!isEditing) {
    return (
      <div className="flex flex-row items-center w-full truncate">
        <input type="hidden" name={`links[${id}][name]`} value={nameInput} />
        <input type="hidden" name={`links[${id}][url]`} value={urlInput} />

        <div className="flex flex-row items-center w-full truncate">
          <div
            className="bg-gray-100 hover:bg-gray-200 transition-colors
              w-[2.25rem] h-[2.25rem] mr-[14px] rounded-full
              text-gray-700 truncate
        flex items-center justify-center "
          >
            <TbLink size={22} />
          </div>
          <div className="max-w-[42vw] flex flex-col flex-1 break-all">
            <Text weight="medium" className="truncate break-all">
              {name}
            </Text>
            <Text className="max-w-full text-gray-500 truncate break-all">
              {url}
            </Text>
          </div>
        </div>
        {/* // Puts current link in "modification" regyme */}
        <Button
          className="mr-4 h-[40px]
                      bg-gray-100 focus:bg-gray-100 border-none
                      flex flex-row items-center justify-around
                      text-gray-600"
          btnType="secondary-alt"
          btnSize="base"
          onClick={() => {
            setEditing(true)
          }}
        >
          <FiEdit size={18} />
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div
      className="
          flex flex-col w-full
          sm:flex-row sm:w-full sm:justify-start sm:items-center
          mb-4 py-3 px-3 truncate
          rounded-md border border-gray-300 "
    >
      <div
        className="
    w-full mb-2
    sm:w-[35.5%] sm:mr-[3%] sm:mb-0"
      >
        <InputText
          type="text"
          id={`${id}-name`}
          name={`links[${id}][name]`}
          required={true}
          heading="Name"
          placeholder="My Website"
          defaultValue={nameInput}
          onChange={(val) => setNameInput(val)}
          error={error ? error['name'] : ''}
        />
      </div>
      <div
        className="
    w-full
    sm:w-[53%] sm:mr-[3%]"
      >
        <InputText
          type="url"
          id={`${id}-url`}
          name={`links[${id}][url]`}
          required={true}
          heading="URL"
          defaultValue={urlInput}
          placeholder="https://mywebsite.com"
          onChange={(val) => setUrlInput(val)}
          error={error ? error['url'] : ''}
        />
      </div>
      {/* Delete current link */}
      <button
        type="button"
        onClick={() => {
          deleteLink(id)
          setFormChanged(true)
        }}
        className="mt-[1.15rem]"
      >
        <HiOutlineTrash size={22} className="text-gray-400" />
      </button>
    </div>
  )
}

export default function AccountSettingsLinks() {
  const { profile, notificationHandler } = useOutletContext<{
    profile: FullProfile
    notificationHandler: (success: boolean) => void
  }>()

  console.log({
    notificationHandler,
    profile,
    // cryptoAddresses,
    // accountURN,
  })

  const transition = useTransition()
  const actionData = useActionData()
  const fetcher = useFetcher()

  const { normalizedAddressProfiles } = useLoaderData()

  const [links, setLinks] = useState<(Link & { editing?: boolean })[]>(
    profile.links || []
  )

  // TODO: make type for this
  const [connectedLinks, setConnectedLinks] = useState<
    {
      addressURN: string
      public?: boolean
      address: string
      title: string
      icon: string
      provider: string
    }[]
  >(normalizedAddressProfiles || [])
  const [isFormChanged, setFormChanged] = useState(false)
  const [isConnectionsChanged, setIsConnectionsChanged] = useState(false)

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      setLinks(actionData?.updatedLinks)
      notificationHandler(!actionData?.errors)
    }
  }, [transition])

  useEffect(() => {
    if (isConnectionsChanged && normalizedAddressProfiles !== connectedLinks) {
      fetcher.submit(
        {
          connections: JSON.stringify(
            connectedLinks.map((l) => {
              return { addressURN: l.addressURN, public: l.public || false }
            })
          ),
        },
        {
          method: 'post',
          action: '/account/connections/order',
        }
      )
      setIsConnectionsChanged(false)
    }
  }, [isConnectionsChanged])

  return (
    <div className="min-h-[76vh] sm:min-h-[70vh] relative">
      {/* Disabled for now */}
      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem] text-gray-800"
      >
        Connected Account Links (coming soon)
      </Text>

      <fetcher.Form method="post" action="/account/connections/order">
        <SortableList
          items={connectedLinks.map((l: any) => ({
            key: `${l.addressURN}`,
            val: l,
            disabled: true,
          }))}
          itemRenderer={(item) => (
            <div className={`flex flex-row items-center w-full`}>
              <img
                className="w-9 h-9 rounded-full mr-3.5"
                src={item.val.icon}
                alt="connected addresses"
              />

              <div className="flex flex-col space-y-1.5 flex-1 break-all">
                <Text size="sm" weight="medium" className="text-gray-700">
                  {item.val.title}
                </Text>
                <Text size="xs" weight="normal" className="text-gray-500">
                  {item.val.address}
                </Text>
              </div>

              <InputToggle
                id={`enable_${item.val.addressURN}`}
                label={''}
                checked={item.val.public}
                disabled={true}
                onToggle={(val) => {
                  const index = connectedLinks.findIndex(
                    (pl: any) => pl.addressURN === item.val.addressURN
                  )

                  // This just updates
                  // toggled connected link
                  // `public` property
                  // which is used in action
                  // to persist or not
                  setConnectedLinks([
                    ...connectedLinks.slice(0, index),
                    {
                      ...connectedLinks[index],
                      public: val,
                    },
                    ...connectedLinks.slice(index + 1),
                  ])
                  setIsConnectionsChanged(true)
                }}
              />
            </div>
          )}
          onItemsReordered={(items) => {
            setConnectedLinks(items.map((i) => i.val))
            setIsConnectionsChanged(true)
          }}
        />
      </fetcher.Form>

      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem]"
      >
        Add custom links
      </Text>
      <Form
        method="post"
        onChange={() => {
          setFormChanged(true)
        }}
        onReset={() => {
          setFormChanged(false)
        }}
        onSubmit={() => {
          setFormChanged(false)
        }}
      >
        <div className="flex flex-col">
          {/* Links that are already in account DO */}
          <div className="flex flex-col mb-3">
            <SortableList
              items={links.map((l, i) => ({ key: `${i}`, val: l }))}
              itemRenderer={(item) => (
                <SortableLink
                  key={`${item.val.name || 'My Website'}-${
                    item.val.url || 'https://mywebsite.com'
                  }-${item.key}`}
                  id={`${item.key}`}
                  link={item.val}
                  setFormChanged={setFormChanged}
                  deleteLink={(id) => {
                    setLinks(links.filter((l, i) => i !== parseInt(id)))
                  }}
                  error={actionData?.errors?.[parseInt(item.key)] || {}}
                />
              )}
              onItemsReordered={(items) => {
                setLinks(items.map((i) => i.val))
                setFormChanged(true)
              }}
            />
          </div>
          <div className="flex flex-row">
            <Button
              type="button"
              onClick={() => {
                setLinks([
                  ...links,
                  { name: '', url: '', verified: false, editing: true },
                ])
              }}
              btnType={'secondary'}
              btnSize={'xl'}
              className="right-0 !text-gray-600
            border-none mb-4 lg:mb-0 w-max text-left
            flex flew-row items-center justify-between"
            >
              <AiOutlinePlus size={22} className="mr-[11px]" /> Add Link
            </Button>
          </div>
        </div>
        {/* Form where this button is used should have 
          an absolute relative position
          div below has relative - this way this button sticks to 
          bottom right

          This div with h-[4rem] prevents everything from overlapping with
          div with absolute position below  */}
        <div className="h-[4rem]" />
        <div className="absolute bottom-0 right-0">
          <SaveButton isFormChanged={isFormChanged} discardFn={() => {}} />
        </div>
      </Form>
    </div>
  )
}
