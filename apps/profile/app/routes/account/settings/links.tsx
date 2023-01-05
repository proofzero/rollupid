import { useState } from 'react'
import { Form } from '@remix-run/react'

import { HiOutlineTrash } from 'react-icons/hi'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { FiEdit } from 'react-icons/fi'
import { TbLink } from 'react-icons/tb'

import { Button, Text } from '@kubelt/design-system'
import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

export default function AccountSettingsLinks() {
  const [isFormChanged, setFormChanged] = useState(false)
  const initialLinks = [{ name: '', url: '' }]
  const [newLinks, setNewLinks] = useState(initialLinks)
  const [trackingLinks, setTrakingLinks] = useState(initialLinks)

  const [links, setLinks] = useState([
    { name: 'My Website', url: 'https://blog.pillowguy.me' },
  ])

  console.log(newLinks, trackingLinks)
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
        onChange={() => {
          setFormChanged(true)
        }}
        onReset={() => {
          setFormChanged(false)
        }}
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
          {links.map((link: any, i: number) => (
            <div
              key={`${link.name || 'My Website'}-${
                link.url || 'https://mywebsite.com'
              }-${i}`}
              className="h-[4rem]
              border border-gray-300 rounded-md
              px-4 py-3
               flex flex-row items-center justify-around truncate
               "
            >
              <div className="flex flex-row items-center grow ">
                <RxDragHandleDots2 size={22} className="mr-[14px]" />{' '}
                <div
                  className="bg-gray-100 w-[2.25rem] h-[2.25rem] mr-[14px] rounded-full
              flex items-center justify-center "
                >
                  <TbLink size={22} />
                </div>
                <div className="flex flex-col truncate">
                  <Text weight="medium">{link.name}</Text>
                  <Text className="text-gray-500">{link.url}</Text>
                </div>
              </div>

              <Button
                className="mr-4 bg-gray-100 border-none
                flex flex-row items-center justify-between
                mr-4"
                btnType="secondary-alt "
                btnSize="sm"
              >
                <FiEdit size={18} />
                Edit
              </Button>
            </div>
          ))}
        </div>
        <button
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
