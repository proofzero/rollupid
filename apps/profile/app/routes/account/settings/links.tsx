import { useState, useEffect } from 'react'

import type { ActionFunction } from 'react-router-dom'
import {
  Form,
  useTransition,
  useOutletContext,
  useActionData,
  useNavigate,
} from '@remix-run/react'

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

  const updatedLinks: any = JSON.parse(formData.get('links'))

  let errors = {}

  updatedLinks.forEach((link: any) => {
    if (!link.name) {
      errors.name = 'All links must have name'
    }
    if (!link.url) {
      errors.url = 'All links must have URL'
    }
  })

  if (Object.keys(errors).length) {
    return { errors }
  }

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  const { displayName, job, location, bio, website, pfp } = profileRes.profile
  await galaxyClient.updateProfile(
    {
      profile: {
        displayName,
        job,
        location,
        bio,
        website,
        pfp,
        links: updatedLinks,
      },
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  return null
}

export default function AccountSettingsLinks() {
  const { notificationHandler } = useOutletContext<any>()
  const transition = useTransition()
  const actionData = useActionData()

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notificationHandler(!actionData?.errors)
    }
  }, [transition])

  const [links, setLinks] = useState(
    useRouteData<ProfileData>('routes/account')?.links
  )

  const navigate = useNavigate()

  const [isFormChanged, setFormChanged] = useState(false)

  const initialLinks = [{ name: '', url: '', verified: false }]

  const [newLinks, setNewLinks] = useState(initialLinks)
  const [hiddenLinks, setHiddenLinks] = useState(initialLinks)

  console.log(newLinks)

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
      <div className="min-h-[31.563rem]">
        <div className="flex flex-col">
          {newLinks.map((link: any, i: number) => {
            console.log('HELLO')
            console.log(link)
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
                    heading="Name"
                    placeholder="My Website"
                    defaultValue={link.name}
                    onChange={(value) => {
                      setFormChanged(true)
                      setHiddenLinks(
                        hiddenLinks.map((link, id) => {
                          if (id == i)
                            return {
                              name: value,
                              url: link.url,
                              verified: link.verified,
                            }
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
                    type="URL"
                    id="URL"
                    heading="URL"
                    defaultValue={link.url}
                    placeholder="https://mywebsite.com"
                    onChange={(value) => {
                      setFormChanged(true)
                      setHiddenLinks(
                        hiddenLinks.map((link, id) => {
                          if (id == i)
                            return {
                              name: link.name,
                              url: value,
                              verified: link.verified,
                            }
                          return link
                        })
                      )
                    }}
                    // error={actionData?.errors?.website}
                  />
                </div>
                <button
                  onClick={() => {
                    setFormChanged(true)
                    setNewLinks(
                      hiddenLinks.filter((link, id) => {
                        return i !== id
                      })
                    )
                    setHiddenLinks(
                      hiddenLinks.filter((link, id) => {
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
                  setNewLinks([...hiddenLinks, links[i]])
                  setHiddenLinks([...hiddenLinks, links[i]])
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
            setNewLinks([...newLinks, { name: '', url: '', verified: false }])
            setHiddenLinks([
              ...hiddenLinks,
              { name: '', url: '', verified: false },
            ])
          }}
          className="right-0 text-indigo-500 text-base w-full
          text-left"
        >
          + Add More
        </button>
      </div>
      {/* This div prevents everything from overlapping with
        div below with absolute position */}
      <div className="h-[4rem]" />
      <Form
        method="post"
        onChange={() => {
          setFormChanged(true)
        }}
        onReset={() => {
          setNewLinks(initialLinks)
          setHiddenLinks(initialLinks)
          setFormChanged(false)
          setNewLinks(initialLinks)
          setHiddenLinks(initialLinks)
        }}
        className="relative"
      >
        <input
          type="hidden"
          name="links"
          value={JSON.stringify((links || []).concat(hiddenLinks))}
        />
        <div className="absolute bottom-0 right-0">
          <SaveButton
            isFormChanged={isFormChanged}
            discardFn={() => {
              setNewLinks(initialLinks)
              setHiddenLinks(initialLinks)
            }}
          />
        </div>
      </Form>
    </>
  )
}
