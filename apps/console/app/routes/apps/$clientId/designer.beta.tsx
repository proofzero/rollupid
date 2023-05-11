import { Tab } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Form } from '@remix-run/react'
import { ReactNode, useState } from 'react'
import { IconType } from 'react-icons'
import { HiOutlineCog, HiOutlineMail } from 'react-icons/hi'
import { DocumentationBadge } from '~/components/DocumentationBadge'

import darkIcon from '~/assets/designer/dark.svg'
import lightIcon from '~/assets/designer/light.svg'

import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import Authentication, {
  AuthenticationConstants,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

import { createClient } from 'wagmi'
import { getDefaultClient } from 'connectkit'
import { Avatar } from '@proofzero/packages/design-system/src/atoms/profile/avatar/Avatar'

const client = createClient(
  // @ts-ignore
  getDefaultClient({
    appName: 'Rollup',
  })
)

enum Theme {
  Light = 'light',
  Dark = 'dark',
}

enum Radius {
  Large = 'lg',
  Medium = 'md',
  Small = 'sm',
}

const DesignerTab = ({
  Icon,
  text,
  selected,
}: {
  Icon: IconType
  text: string
  selected: boolean
}) => (
  <div
    className={`box-border -mb-0.5 mr-8 pb-4 px-1 flex flex-row items-center gap-2 border-b-2 ${
      selected ? 'border-indigo-600' : 'border-transparent'
    }`}
  >
    <Icon
      className={`w-5 h-5 ${selected ? 'text-indigo-600' : 'text-gray-500'}`}
    />
    <Text
      size="sm"
      weight="medium"
      className={`${selected ? 'text-indigo-600' : 'text-gray-500'}
        }`}
    >
      {text}
    </Text>
  </div>
)

const FormElement = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => {
  return (
    <div className="flex flex-row items-center justify-between px-8 py-4">
      <Text size="sm" weight="medium" className="text-gray-900">
        {label}
      </Text>

      {children}
    </div>
  )
}

const RadiusButton = ({
  radius,
  selectedRadius,
  setRadius,
}: {
  radius: Radius
  selectedRadius: Radius | undefined
  setRadius: React.Dispatch<React.SetStateAction<Radius>>
}) => {
  let label
  switch (radius) {
    case Radius.Large:
      label = 'Large'
      break
    case Radius.Small:
      label = 'Small'
      break
    case Radius.Medium:
      label = 'Medium'
      break
    default:
      throw new Error('Invalid radius')
  }

  const selected = selectedRadius === radius

  return (
    <button
      className={`py-1.5 px-2.5 rounded-md ${selected ? 'bg-indigo-500' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        setRadius(radius)
      }}
    >
      <Text
        size="xs"
        weight="medium"
        className={`${selected ? 'text-white' : 'text-gray-500'}`}
      >
        {label}
      </Text>
    </button>
  )
}

export default () => {
  const [theme, setTheme] = useState<Theme>(Theme.Light)
  const [heading, setHeading] = useState<string>()
  const [radius, setRadius] = useState<Radius>(Radius.Medium)

  return (
    <Form>
      <section className="flex flex-row items-center justify-between mb-11">
        <div className="flex flex-row items-center space-x-3">
          <Text
            size="2xl"
            weight="semibold"
            className="text-gray-900 ml-2 lg:ml-0 "
          >
            Designer
          </Text>

          <DocumentationBadge url="https://docs.rollup.id/platform/console/designer" />
        </div>

        <div>
          <button type="submit">SAVE</button>
        </div>
      </section>

      <Tab.Group>
        <Tab.List className="flex flex-row items-center border-b mb-6">
          <Tab className="outline-0">
            {({ selected }) => (
              <DesignerTab
                Icon={HiOutlineCog}
                text="Login"
                selected={selected}
              />
            )}
          </Tab>

          <Tab className="outline-0" disabled>
            {({ selected }) => (
              <DesignerTab
                Icon={HiOutlineMail}
                text="OTP Email"
                selected={selected}
              />
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel className="flex flex-row gap-7">
            <section className="flex-1 bg-white border rounded-lg">
              <Text
                size="lg"
                weight="semibold"
                className="mx-8 my-4 text-gray-900"
              >
                Login Settings
              </Text>

              <FormElement label="Theme">
                <input id="theme" name="theme" type="hidden" value={theme} />

                <div className="flex flex-row gap-4 items-center">
                  <button
                    className={`border rounded-full ${
                      theme === Theme.Light ? 'outline outline-indigo-500' : ''
                    } w-7 h-7 overflow-hidden`}
                    onClick={(e) => {
                      e.preventDefault()
                      setTheme(Theme.Light)
                    }}
                  >
                    <img src={lightIcon} />
                  </button>
                  <button
                    className={`border rounded-full ${
                      theme === Theme.Dark ? 'outline outline-indigo-500' : ''
                    } w-7 h-7 overflow-hidden`}
                    onClick={(e) => {
                      e.preventDefault()
                      setTheme(Theme.Dark)
                    }}
                  >
                    <img src={darkIcon} />
                  </button>
                </div>
              </FormElement>

              <FormElement label="Heading">
                <Input
                  id={'heading'}
                  label={''}
                  placeholder={AuthenticationConstants.defaultHeading}
                  className="w-80"
                  onChange={(e) => {
                    setHeading(e.target.value)
                  }}
                />
              </FormElement>

              <FormElement label="Radius">
                <input id="radius" name="radius" type="hidden" value={radius} />

                <div className="p-1 border shadow-sm rounded">
                  <RadiusButton
                    radius={Radius.Large}
                    setRadius={setRadius}
                    selectedRadius={radius}
                  />
                  <RadiusButton
                    radius={Radius.Medium}
                    setRadius={setRadius}
                    selectedRadius={radius}
                  />
                  <RadiusButton
                    radius={Radius.Small}
                    setRadius={setRadius}
                    selectedRadius={radius}
                  />
                </div>
              </FormElement>
            </section>

            <section className="flex-1 bg-white border rounded-lg pointer-events-none pb-3">
              <Text
                size="lg"
                weight="semibold"
                className="mx-8 my-4 text-gray-900"
              >
                Preview
              </Text>

              <Authentication
                Header={
                  <>
                    <Avatar
                      src={AuthenticationConstants.defaultLogoURL}
                      size="sm"
                    ></Avatar>
                    <div className={'flex flex-col items-center gap-2'}>
                      <h1 className={'font-semibold text-xl'}>
                        {heading ?? AuthenticationConstants.defaultHeading}
                      </h1>

                      <h2
                        style={{ color: '#6B7280' }}
                        className={'font-medium text-base'}
                      >
                        {AuthenticationConstants.defaultSubheading}
                      </h2>
                    </div>
                  </>
                }
                displayKeys={AuthenticationConstants.knownKeys}
                mapperArgs={{
                  clientId: 'Foo',
                  wagmiClient: client,
                  signData: null,
                }}
                radius={radius}
              />
            </section>
          </Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Form>
  )
}
