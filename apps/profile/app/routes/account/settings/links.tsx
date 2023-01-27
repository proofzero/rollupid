import { useState, useEffect } from 'react'

import {
  Form,
  useTransition,
  useOutletContext,
  useActionData,
  useLoaderData,
} from '@remix-run/react'

import { requireJWT } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'

import { Tooltip } from 'flowbite-react'
import { HiOutlineTrash } from 'react-icons/hi'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'
import { AiOutlinePlus } from 'react-icons/ai'

import type { Profile } from '@kubelt/galaxy-client'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { SortableList } from '@kubelt/design-system/src/atoms/lists/SortableList'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import { AddressURN } from '@kubelt/urns/address'
import { NodeType } from '@kubelt/types/address'

export type ProfileData = {
  targetAddress: string
  displayName: string
  isOwner: boolean
  pfp: {
    image: string
    isToken: string
  }
  links: {
    name: string
    url: string
    verified: boolean
  }[]
}

const normalizeProfile = (profile: any) => {
  switch (profile.__typename) {
    case 'OAuthGithubProfile':
      return {
        id: profile.urn,
        address: profile.html_url,
        title: 'GitHub',
        icon: profile.avatar_url,
      }
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressTypeUrns = addresses.map((a) => ({
    urn: a.urn,
    nodeType: a.rc.node_type,
  }))

  // This returns profiles without urns
  const profiles =
    (await getAddressProfiles(
      jwt,
      addressTypeUrns.map((atu) => atu.urn as AddressURN)
    )) ?? []

  // This mapps to a new structure that contains urn also;
  // useful for list keys as well as for address context actions as param
  const mappedProfiles = profiles.map((p, i) => ({
    ...addressTypeUrns[i],
    ...p,
  }))

  const oAuthProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.OAuth)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile)

  return {
    oAuthProfiles,
  }
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  /**
   * Updated names and urls are fetched from inputText
   * And separately I created hidden input for previous unchanged links
   * to not forget to include them on profile too
   */
  const updatedNames: any = formData.getAll('name')
  const updatedUrls: any = formData.getAll('url')
  const remainedLinks: any = JSON.parse(formData.get('links') as string)

  const updatedLinks: any = remainedLinks.concat(
    updatedNames.map((name: string, i: number) => {
      return {
        name,
        url: updatedUrls[i],
        verified: false,
      }
    })
  )

  const errors = {}

  updatedLinks.forEach((link: any, id: number) => {
    /** This is the way
     * I attach new props to an empty object
     */

    if (!link.name) {
      errors[`${id}`] = {}
      errors[`${id}`].name = 'All links must have name'
      if (!errors['text']) errors['text'] = 'All links must have name'
    }
    if (!link.url) {
      if (!errors[`${id}`]) errors[`${id}`] = {}
      errors[`${id}`].url = 'All links must have URL'
      if (!errors['text']) errors['text'] = 'All links must have URL'
    }
  })

  if (Object.keys(errors).length) {
    return { errors }
  }
  const galaxyClient = await getGalaxyClient()

  /** TODO:
   * fetch errors when this updated profile doesn't
   * pass back-end schema validation
   */

  await galaxyClient.updateLinks(
    {
      links: updatedLinks,
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  return { updatedLinks }
}

const SortableLink = (props: any) => {
  return (
    <div className={`flex flex-row items-center w-full truncate`}>
      <Tooltip content="Copy" className="text-black">
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 transition-colors
              w-[2.25rem] h-[2.25rem] mr-[14px] rounded-full
              text-gray-700
        flex items-center justify-center "
          onClick={() => {
            navigator.clipboard.writeText(props.link.url)
          }}
        >
          <TbLink size={22} />
        </button>
      </Tooltip>
      <div className="flex flex-col flex-1">
        <Text weight="medium" className="truncate">
          {props.link.name}
        </Text>
        <Text className="text-gray-500 truncate">{props.link.url}</Text>
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
          props.setLinks(
            props.links.filter((link, id) => id !== parseInt(props.id))
          )
          props.setNewLinks([
            ...props.newLinks,
            props.links[parseInt(props.id)],
          ])
        }}
      >
        <FiEdit size={18} />
        Edit
      </Button>
    </div>
  )
}

export default function AccountSettingsLinks() {
  const { profile, notificationHandler } = useOutletContext<{
    profile: Profile
    notificationHandler: (success: boolean) => void
  }>()

  const transition = useTransition()
  const actionData = useActionData()

  const { oAuthProfiles } = useLoaderData()

  const initialOldLinks = profile.links || []

  const [links, setLinks] = useState(initialOldLinks)
  const [oAuthLinks, setOAuthLinks] = useState(oAuthProfiles)

  const [isFormChanged, setFormChanged] = useState(false)

  const initialLinks: any[] = []

  const [newLinks, setNewLinks] = useState(initialLinks)

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      setLinks(actionData?.updatedLinks)
      notificationHandler(!actionData?.errors)
    }
  }, [transition])

  return (
    <>
      {/* Disabled for now */}
      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem] text-gray-800"
      >
        Connected Account Links
      </Text>

      <SortableList
        items={oAuthLinks.map((l: any) => ({ key: `${l.id}`, val: l }))}
        itemRenderer={(item) => (
          <div className="flex flex-row items-center w-full">
            <img className="w-9 h-9 rounded-full mr-3.5" src={item.val.icon} />

            <div className="flex flex-col space-y-1.5">
              <Text size="sm" weight="medium" className="text-gray-700">
                {item.val.title}
              </Text>
              <Text size="xs" weight="normal" className="text-gray-500">
                {item.val.address}
              </Text>
            </div>
          </div>
        )}
        onItemsReordered={(items) => {
          setOAuthLinks(items.map((i) => i.val))
          setFormChanged(true)
        }}
      />

      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem]"
      >
        Add links manually
      </Text>
      <Form
        method="post"
        onChange={() => {
          setFormChanged(true)
        }}
        onReset={() => {
          setNewLinks(initialLinks)
          setFormChanged(false)
        }}
        onSubmit={() => {
          setNewLinks(initialLinks)
          setFormChanged(false)
        }}
        className="relative min-h-[35.563rem]"
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
                  links={links}
                  setNewLinks={setNewLinks}
                  setLinks={setLinks}
                  newLinks={newLinks}
                />
              )}
              onItemsReordered={(items) => {
                setLinks(items.map((i) => i.val))
                setFormChanged(true)
              }}
            />
          </div>
          <input type="hidden" name="links" value={JSON.stringify(links)} />
          {newLinks.map((link: any, i: number) => {
            //Check if there is an error
            const isError = actionData?.errors && actionData?.errors[`${i}`]

            return (
              <div
                key={`${link.name || 'My Website'}-${
                  link.url || 'https://mywebsite.com'
                }-${i}`}
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
                    id="Name"
                    name="name"
                    required={true}
                    heading="Name"
                    placeholder="My Website"
                    defaultValue={link.name}
                    error={
                      isError && actionData?.errors[`${i}`]['name']
                        ? actionData?.errors[`${i}`]['name']
                        : ''
                    }
                  />
                </div>
                <div
                  className="
                w-full
                sm:w-[53%] sm:mr-[3%]"
                >
                  <InputText
                    type="url"
                    id="URL"
                    name="url"
                    required={true}
                    heading="URL"
                    defaultValue={link.url}
                    placeholder="https://mywebsite.com"
                    error={
                      isError && actionData?.errors[`${i}`]['url']
                        ? actionData?.errors[`${i}`]['url']
                        : ''
                    }
                  />
                </div>
                {/* Delete current link */}
                <button
                  type="button"
                  onClick={() => {
                    setFormChanged(true)
                    setNewLinks(
                      newLinks.filter((link, id) => {
                        return i !== id
                      })
                    )
                  }}
                  className="mt-[1.15rem]"
                >
                  <HiOutlineTrash size={22} className="text-gray-400" />
                </button>
              </div>
            )
          })}
          <Button
            type="button"
            onClick={() => {
              setNewLinks([...newLinks, { name: '', url: '', verified: false }])
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
            discardFn={() => {
              setNewLinks(initialLinks)
              setLinks(initialOldLinks)
            }}
          />
        </div>
      </Form>
    </>
  )
}
