import { useState, useEffect } from 'react'
import qs from 'qs'
import {
  Form,
  useTransition,
  useOutletContext,
  useActionData,
  useFetcher,
} from '@remix-run/react'

import { getProfileSession, parseJwt } from '~/utils/session.server'

import { HiOutlineTrash } from 'react-icons/hi'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'
import { AiOutlinePlus } from 'react-icons/ai'

import type { AddressProfile } from '@proofzero/galaxy-client'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { SortableList } from '@proofzero/design-system/src/atoms/lists/SortableList'

import type { Link, Links } from '~/types'
import { LinksSchema } from '~/validation'

import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

import type { ActionFunction } from '@remix-run/cloudflare'

import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { CryptoAddressType, OAuthAddressType } from '@proofzero/types/address'
import { imageFromAddressType } from '~/helpers'
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
        address: `https://twitter.com/${ap.profile.screen_name}`,
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

export const action: ActionFunction = async ({ request, context }) => {
  const session = await getProfileSession(request)
  const user = session.get('user')

  const { sub: accountURN } = parseJwt(user.accessToken)

  const formDataText = await request.text()
  const formData = qs.parse(formDataText) as unknown as { links: Links }

  /**
   * Updated names and urls are fetched from inputText
   * And separately I created hidden input for previous unchanged links
   * to not forget to include them on profile too
   */
  const updatedLinks = formData['links']

  // Schema Validation
  const zodValidation = LinksSchema.safeParse(updatedLinks)

  console.log({ links: JSON.stringify(zodValidation) })

  if (!zodValidation.success) {
    return {
      errors: zodValidation.error.issues[0].message,
    }
  }

  const currentProfile = await ProfileKV.get<FullProfile>(accountURN!, 'json')
  const updatedProfile = Object.assign(currentProfile || {}, {
    links: zodValidation.data,
  })
  await ProfileKV.put(accountURN!, JSON.stringify(updatedProfile))

  return { updatedLinks: updatedLinks || [] }
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
          <div className="max-w-[30vw] sm:max-w-[45vw] flex flex-col flex-1 break-all">
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
          className="sm:mr-4 h-[40px]
                      bg-gray-100 focus:bg-gray-100 border-none
                      flex flex-row items-center justify-around
                      text-gray-600 overflow-hidden"
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
          flex flex-row 
          sm:flex-col sm:w-full sm:justify-start sm:items-end
          mb-4 py-3 px-4 sm:px-3 truncate
          rounded-md border border-gray-300 "
    >
      <div className="flex flex-col w-full">
        <div
          className="
    w-full mb-2
    sm:mr-[3%] sm:mb-0"
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
    w-full my-1 max-sm:my-2
    sm:mr-[3%]"
        >
          <InputText
            type="url"
            id={`${id}-url`}
            name={`links[${id}][url]`}
            required={true}
            heading="URL"
            autoCompute={false}
            defaultValue={urlInput}
            placeholder="https://mywebsite.com"
            onChange={(val) => setUrlInput(val)}
            error={error ? error['url'] : ''}
          />
        </div>
      </div>
      {/* Delete current link */}
      <button
        type="button"
        onClick={() => {
          deleteLink(id)
          setFormChanged(true)
        }}
        className="mt-[1.15rem] pl-4"
      >
        <HiOutlineTrash size={22} className="text-gray-400" />
      </button>
    </div>
  )
}

export default function AccountSettingsLinks() {
  const { profile, notify, connectedProfiles } = useOutletContext<{
    profile: FullProfile
    notify: (success: boolean) => void
    connectedProfiles: any[]
  }>()

  const transition = useTransition()
  const actionData = useActionData()
  const fetcher = useFetcher()

  const normalizedAddressProfiles = connectedProfiles.map(
    normalizeAddressProfile
  )

  const [links, setLinks] = useState<(Link & { editing?: boolean })[]>(
    profile?.links || []
  )

  // TODO: make type for this
  const [connectedLinks, setConnectedLinks] = useState<
    (
      | {
          addressURN?: string
          public?: boolean
          address?: string | null
          title?: string | null
          icon?: string | null
          provider?: string
        }
      | undefined
    )[]
  >(normalizedAddressProfiles)
  const [isFormChanged, setFormChanged] = useState(false)
  const [isConnectionsChanged, setIsConnectionsChanged] = useState(false)

  useEffect(() => {
    if (transition.type === 'actionReload') {
      if (!actionData.errors) {
        setFormChanged(false)
        setLinks(actionData.updatedLinks)
      }
      notify(!actionData.errors)
    }
  }, [transition])

  useEffect(() => {
    if (isConnectionsChanged && normalizedAddressProfiles !== connectedLinks) {
      fetcher.submit(
        {
          connections: JSON.stringify(
            connectedLinks.map((l) => {
              return { addressURN: l?.addressURN, public: l?.public || false }
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
    <div className="min-h-[70vh] relative">
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        Links
      </Text>
      {/* Disabled for now */}
      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem] text-gray-800"
      >
        Connected Account Links (coming soon)
      </Text>

      <fetcher.Form
        method="post"
        action="/account/connections/order"
        className="w-screen -mx-4 sm:w-full sm:mx-0"
      >
        <fieldset disabled={true}>
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
        </fieldset>
      </fetcher.Form>

      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem]"
      >
        Add custom Links
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
        <div
          className="flex flex-col 
        w-screen -mx-4 sm:w-full sm:mx-0"
        >
          {/* Links that are already in account DO */}
          <div className="flex flex-col mb-3">
            <SortableList
              items={links.map((l, i) => ({
                key: `${i}`,
                val: l,
                isSortable: !l.editing,
              }))}
              itemRenderer={(item) => {
                return (
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
                )
              }}
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
              className="right-0 !text-gray-700
            border-none mb-4 lg:mb-0 w-full sm:w-max text-left
            flex flew-row items-center justify-center sm:justify-between"
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
