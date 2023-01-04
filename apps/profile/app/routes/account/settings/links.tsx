import { useState } from 'react'
import { Form } from '@remix-run/react'

import { FaGlobe } from 'react-icons/fa'

import { HiOutlinePlusCircle } from 'react-icons/hi'
import { Button, Text } from '@kubelt/design-system'
import InputText from '~/components/inputs/InputText'
import SaveButton from '~/components/accounts/SaveButton'

export default function AccountSettingsLinks() {
  const [isFormChanged, setFormChanged] = useState(false)
  const initialLinks = [{ name: '', path: 'https://' }]
  const [links, setLinks] = useState(initialLinks)

  return (
    <>
      <Text className="my-4">Select links to display on your profile page</Text>
      <Form
        onChange={() => {
          setFormChanged(true)
        }}
        onReset={() => {
          setFormChanged(false)
        }}
      >
        <div className="flex flex-col mb-6">
          {links.map((link: any, i: number) => (
            <div
              key={`${link.name}-${link.path}-${i}`}
              className="flex flex-row w-full justify-between mb-4 lg:mb-0"
            >
              <div className="w-[47.5%]">
                <InputText
                  type="text"
                  id="Name"
                  heading="Name"
                  defaultValue={''}
                  // error={actionData?.errors?.website}
                />
              </div>

              <div className="w-[47.5%]">
                <InputText
                  type="url"
                  id="website"
                  heading="Website"
                  Icon={FaGlobe}
                  defaultValue={link.path}
                  // error={actionData?.errors?.website}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row justify-between">
          <Button
            onClick={() => {
              setLinks([...links, { name: '', path: 'https://' }])
            }}
            className="right-0"
          >
            <div className="flex flex-row justify-between items-center w-full">
              <HiOutlinePlusCircle size={16} className="mr-1" /> Add Link
            </div>
          </Button>

          <SaveButton
            isFormChanged={isFormChanged}
            discardFn={() => {
              setLinks(initialLinks)
            }}
          />
        </div>
      </Form>
    </>
  )
}
