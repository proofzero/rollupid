import { useState } from 'react'

import type { ActionFunction } from 'react-router-dom'
import { useSubmit, Form } from '@remix-run/react'

import { requireJWT } from '~/utils/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { getGalaxyClient } from '~/helpers/clients'

import { HiOutlineTrash } from 'react-icons/hi'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'

import { Button, Text } from '@kubelt/design-system'
import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

import { useRouteData } from '~/hooks'

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

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  console.log(formData)
  const name = formData.get('name')

  console.log('ONE', formData.get('name'))
  console.log('TWO', formData.get('name'))

  const url = formData.get('url')
  console.log(name, url)
  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  const { displayName, job, location, bio, website, pfp, links } =
    profileRes.profile
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName,
        // TODO: support for default address
        job,
        location,
        bio,
        website,
        pfp,
        links: [...links, { name, url, verified: false }],
      },
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  return null
}

export default function AccountSettingsLinks() {
  const [links, setLinks] = useState(
    useRouteData<ProfileData>('routes/account')?.links
  )
  const [isFormChanged, setFormChanged] = useState(false)
  const initialLinks = [{ name: '', url: '', verified: false }]
  const [newLinks, setNewLinks] = useState(initialLinks)
  const [trackingLinks, setTrakingLinks] = useState(initialLinks)
  const submit = useSubmit()

  const handleSubmit = (event: any) => {
    console.log('NEW LINKS', trackingLinks)
    submit(trackingLinks, { replace: true })

    setNewLinks(initialLinks)
    setTrakingLinks(initialLinks)
  }

  return (
    <>
      <Text
        size="base"
        weight="semibold"
        className="mt-[2.875rem] mb-[1.375rem] text-gray-300"
      >
        Connected Account Links
      </Text>
      <div></div>
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
          setFormChanged(false)
        }}
        onSubmit={handleSubmit}
        className="min-h-[35.563rem] relative"
      >
        <div className="flex flex-col">
          {newLinks.map((link: any, i: number) => {
            console.log('from renderer', link)
            return (
              <div
                key={`${link.name || 'My Website'}-${
                  link.url || 'https://mywebsite.com'
                }-${i}`}
                className="
              flex flex-col w-full 
              sm:flex-row sm:w-full sm:justify-start sm:items-center
              mb-4 py-3 px-3
              rounded-md border border-gray-300"
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
                    heading="Name"
                    placeholder="My Website"
                    defaultValue={link.name}
                    onChange={(value) => {
                      setTrakingLinks(
                        trackingLinks.map((link, id) => {
                          if (id == i) return { name: value, url: link.url }
                          return link
                        })
                      )
                    }}
                    // error={actionData?.errors?.website}
                  />
                </div>

                <div
                  className="
                w-full
                sm:w-[53%] sm:mr-[3%]"
                >
                  <InputText
                    type="url"
                    id="url"
                    name="url"
                    heading="URL"
                    defaultValue={link.url}
                    placeholder="https://mywebsite.com"
                    onChange={(value) => {
                      setTrakingLinks(
                        trackingLinks.map((link, id) => {
                          if (id == i) return { name: link.name, url: value }
                          return link
                        })
                      )
                    }}
                    // error={actionData?.errors?.website}
                  />
                </div>
                <button
                  onClick={() => {
                    setTrakingLinks(
                      trackingLinks.filter((link, id) => {
                        return i !== id
                      })
                    )
                    setNewLinks(
                      trackingLinks.filter((link, id) => {
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
        </div>
        <div className="flex flex-col mb-3">
          {(links || []).map((link: any, i: number) => (
            <div
              key={`${link.name || 'My Website'}-${
                link.url || 'https://mywebsite.com'
              }-${i}`}
              className="
              border border-gray-300 rounded-md
              px-4 py-3 mb-3
               flex flex-row items-center justify-around truncate
               "
            >
              <div className="flex flex-row items-center grow ">
                <RxDragHandleDots2 size={22} className="mr-[14px]" />{' '}
                <button
                  className="bg-gray-100 w-[2.25rem] h-[2.25rem] mr-[14px] rounded-full
              flex items-center justify-center "
                  onClick={() => {
                    navigator.clipboard.writeText(link.url)
                  }}
                >
                  <TbLink size={22} />
                </button>
                <div className="flex flex-col truncate">
                  <Text weight="medium">{link.name}</Text>
                  <Text className="text-gray-500">{link.url}</Text>
                </div>
              </div>

              <Button
                className="mr-4 h-[40px] 
                bg-gray-100 focus:bg-gray-100 border-none
                flex flex-row items-center justify-around
                text-gray-600"
                btnType="secondary-alt"
                btnSize="base"
                onClick={() => {
                  setLinks(links.filter((link, id) => id !== i))
                  setNewLinks([...newLinks, links[i]])
                }}
              >
                <FiEdit size={18} />
                Edit
              </Button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setNewLinks([...newLinks, { name: '', url: '' }])
            setTrakingLinks([...trackingLinks, { name: '', url: '' }])
          }}
          className="right-0 text-indigo-500 text-base w-full
          text-left"
        >
          + Add More
        </button>

        {/* This div prevents everything from overlapping with
        div below with absolute position */}
        <div className="h-[4rem]" />

        <div className="absolute bottom-0 right-0">
          <SaveButton
            onClick={handleSubmit}
            isFormChanged={isFormChanged}
            discardFn={() => {
              setNewLinks(initialLinks)
              setTrakingLinks(initialLinks)
            }}
          />
        </div>
      </Form>
    </>
  )
}
