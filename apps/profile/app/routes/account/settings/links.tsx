import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useLayoutEffect,
} from 'react'

import type { ActionFunction } from 'react-router-dom'
import {
  Form,
  useTransition,
  useOutletContext,
  useActionData,
} from '@remix-run/react'

import {
  useSensor,
  useSensors,
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core'
import {
  useSortable,
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { requireJWT } from '~/utils/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { getGalaxyClient } from '~/helpers/clients'

import { HiOutlineTrash } from 'react-icons/hi'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Tooltip } from 'flowbite-react'

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

  /**
   * Updated names and urls are fetched from inputText
   * And separately I created hidden input for previous unchanged links
   * to not forget to include them on profile too
   */
  const updatedNames: any = formData.getAll('name')
  const updatedUrls: any = formData.getAll('url')
  const remainedLinks: any = JSON.parse(formData.get('links'))

  const updatedLinks: any = remainedLinks.concat(
    updatedNames.map((name: string, i: number) => {
      console.log('HELLO MAN')
      console.log(i)
      return { name, url: updatedUrls[i], verified: false, links_order: i }
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

  console.log('FROM LINKS', updatedLinks)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })
  const updatedProfile = profileRes.profile

  /** TODO:
   * fetch errors when this updated profile doesn't
   * pass back-end schema validation
   */
  await galaxyClient.updateProfile(
    {
      profile: {
        ...updatedProfile,
        links: updatedLinks,
      },
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  return { updatedLinks }
}

const SortableLink = (props: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={`
                   border border-gray-300 rounded-md
                    px-4 py-3 mb-3 truncate bg-white
                    flex flex-row items-center justify-between
                    ${isDragging ? 'shadow-inner z-100' : ''}
                     `}
      ref={setNodeRef}
      style={style}
    >
      <div className={`flex flex-row items-center w-full truncate`}>
        <button
          className="text-gray-400"
          type="button"
          {...attributes}
          {...listeners}
        >
          <RxDragHandleDots2 size={22} className="mr-[14px]" />{' '}
        </button>
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
        <div className="flex flex-col max-w-[600px]">
          <Text weight="medium" className="truncate">
            {props.link.name}
          </Text>
          <Text className="text-gray-500 truncate">{props.link.url}</Text>
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
        // onClick={() => {
        //   setLinks(links.filter((link, id) => id !== i))
        //   setNewLinks([...newLinks, links[i]])
        // }}
      >
        <FiEdit size={18} />
        Edit
      </Button>
    </div>
  )
}

export default function AccountSettingsLinks() {
  const [items, setItems] = useState(['1', '2', '3'])

  const { notificationHandler } = useOutletContext<any>()
  const transition = useTransition()
  const actionData = useActionData()

  const [activeId, setActiveId] = useState(null)
  const [activeLink, setActiveLink] = useState(null)
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [links, setLinks] = useState(
    useRouteData<ProfileData>('routes/account')?.links || []
  )

  const handleDragCancel = () => {
    setActiveLink(null)
    setActiveId(null)
  }

  const handleDragStart = ({ active }: { active: any }) => {
    const id = parseInt(active.id)
    setActiveLink(active.data.current.sortable.items[id])
    setActiveId(id as any)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    const active_id = parseInt(active.id)
    const over_id = parseInt(over.id)

    if (active_id !== over_id) {
      setLinks((links) => {
        const oldIndex = parseInt(active.id)
        const newIndex = parseInt(over.id)

        return arrayMove(links, oldIndex, newIndex)
      })
      setFormChanged(true)
    }
    setActiveId(null)
    setActiveLink(null)
  }

  const [isFormChanged, setFormChanged] = useState(false)

  const initialLinks = [{ name: '', url: '', verified: false }]

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
        className="mt-[2.875rem] mb-[1.375rem] text-gray-300"
      >
        Connected Account Links
      </Text>
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
        className="relative min-h-[35.563rem]"
      >
        <div className="flex flex-col">
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
          {/* Links that are already in account DO */}
          <div className="flex flex-col mb-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((link, id) => `${id}`)}
                strategy={verticalListSortingStrategy}
              >
                {(links || []).map((link: any, i: number) => (
                  <SortableLink
                    key={`${link.name || 'My Website'}-${
                      link.url || 'https://mywebsite.com'
                    }-${i}`}
                    id={`${i}`}
                    link={link}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <input type="hidden" name="links" value={JSON.stringify(links)} />
          <button
            type="button"
            onClick={() => {
              setNewLinks([...newLinks, { name: '', url: '', verified: false }])
            }}
            className="right-0 text-indigo-500 text-base w-max
          text-left"
          >
            + Add More
          </button>
        </div>

        <SaveButton
          isFormChanged={isFormChanged}
          discardFn={() => {
            setNewLinks(initialLinks)
          }}
        />
      </Form>
    </>
  )
}
