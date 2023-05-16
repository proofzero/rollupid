import { Popover, Tab } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Form, useLoaderData } from '@remix-run/react'
import { ReactNode, useState } from 'react'
import { IconType } from 'react-icons'
import { HiCog, HiOutlineCog, HiOutlineMail } from 'react-icons/hi'
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
import IconPicker from '~/components/IconPicker'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { SortableList } from '@proofzero/design-system/src/atoms/lists/SortableList'
import _ from 'lodash'
import getProviderIcons from '@proofzero/design-system/src/helpers/get-provider-icons'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { HexColorPicker } from 'react-colorful'
import { AppTheme } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { ActionFunction, LoaderFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { GetAppThemesResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppThemes'
import { BadRequestError } from '@proofzero/errors'

const client = createClient(
  // @ts-ignore
  getDefaultClient({
    appName: 'Rollup',
  })
)

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
    <div className="flex flex-col lg:flex-row lg:items-center px-8 py-4">
      <Text
        size="sm"
        weight="medium"
        className="text-gray-900 flex-1 mb-2 lg:mb-0"
      >
        {label}
      </Text>

      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

const RadiusButton = ({
  radius,
  selectedRadius,
  setRadius,
}: {
  radius: string
  selectedRadius: string | undefined
  setRadius: React.Dispatch<React.SetStateAction<string>>
}) => {
  let label
  switch (radius) {
    case 'lg':
      label = 'Large'
      break
    case 'sm':
      label = 'Small'
      break
    case 'md':
      label = 'Medium'
      break
    default:
      throw new Error('Invalid radius')
  }

  const selected = selectedRadius === radius

  return (
    <button
      type="button"
      className={`w-full py-1.5 px-2.5 rounded-md ${
        selected ? 'bg-indigo-500' : ''
      }`}
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

const ProviderModal = ({
  providers,
  isOpen,
  handleClose,
  saveCallback,
}: {
  providers: {
    key: string
    enabled: boolean
  }[]
  isOpen: boolean
  handleClose: (val: boolean) => void
  saveCallback: (providers: { key: string; enabled: boolean }[]) => void
}) => {
  const [selectedProviders, setSelectedProviders] = useState(() => {
    return providers.map((p) => {
      return {
        key: p.key,
        val: _.startCase(p.key),
        enabled: p.enabled,
      }
    })
  })

  return (
    <Modal isOpen={isOpen} fixed handleClose={() => handleClose(false)}>
      <div className="bg-white px-6 py-8 max-w-full lg:w-[543px] lg:mx-auto border shadow rounded-lg">
        <Text weight="semibold" className="text-left text-gray-800 mb-4">
          Login Provider Configuration
        </Text>

        <section>
          <SortableList
            items={selectedProviders}
            itemRenderer={(item) => (
              <div className="flex flex-row gap-5 w-full items-center">
                <img
                  className="h-8 w-8"
                  src={getProviderIcons(item.key) ?? undefined}
                />

                <Text
                  size="sm"
                  weight="medium"
                  className="flex-1 text-left text-gray-700"
                >
                  {item.val}
                </Text>

                <InputToggle
                  label={''}
                  id={`enable-${item.key}`}
                  checked={item.enabled}
                  onToggle={(val) => {
                    setSelectedProviders((prev) => {
                      const newProviders = [...prev]
                      const index = newProviders.findIndex(
                        (p) => p.key === item.key
                      )
                      newProviders[index].enabled = val
                      return newProviders
                    })
                  }}
                />
              </div>
            )}
            onItemsReordered={setSelectedProviders}
          />
        </section>

        <section className="flex flex-row-reverse gap-4 mt-4">
          <Button
            btnType="primary-alt"
            onClick={() => {
              saveCallback(selectedProviders)
              handleClose(true)
            }}
          >
            Save
          </Button>
          <Button btnType="secondary-alt" onClick={() => handleClose(true)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const clientId = params?.clientId

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const appThemes = await starbaseClient.getAppThemes.query({
    clientId,
  })

  return json({
    appThemes,
  })
}

export const action: ActionFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const clientId = params?.clientId

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const fd = await request.formData()
  const targetTheme = fd.get('theme')
  if (!targetTheme) {
    throw new BadRequestError({
      message: 'Theme is required',
    })
  }

  const heading = fd.get('heading') as string
  const radius = fd.get('radius') as string
  const color = fd.get('color') as string
  const graphicURL = fd.get('image') as string

  const themeData: AppTheme = {
    heading,
    radius,
    color,
    graphicURL,
  }

  console.log({
    themeData,
  })

  await starbaseClient.setAppTheme.mutate({
    clientId: clientId,
    theme: {
      key: targetTheme as string,
      data: themeData,
    },
  })

  return null
}

export default () => {
  const { appThemes } = useLoaderData<{
    appThemes: GetAppThemesResult
  }>()

  console.log({
    appThemes,
  })

  const [theme, setTheme] = useState<string>('light')
  const [heading, setHeading] = useState<string>(
    appThemes && appThemes['light'].heading ? appThemes['light'].heading : ''
  )
  const [radius, setRadius] = useState<string>(
    appThemes && appThemes['light'].radius ? appThemes['light'].radius : 'md'
  )

  const [color, setColor] = useState<string>(
    appThemes && appThemes['light'].color ? appThemes['light'].color : '#6366F1'
  )
  const [graphicURL, setGraphicURL] = useState<string | undefined>(
    appThemes && appThemes['light'].graphicURL
      ? appThemes['light'].graphicURL
      : undefined
  )

  const [loading, setLoading] = useState<boolean>(false)

  const [providers, setProviders] = useState<
    {
      key: string
      enabled: boolean
    }[]
  >(
    appThemes?.light?.providers ??
      AuthenticationConstants.knownKeys.map((k) => ({
        key: k,
        enabled: true,
      }))
  )
  const [providerModalOpen, setProviderModalOpen] = useState<boolean>(false)

  return (
    <>
      {loading && <Loader />}

      <ProviderModal
        providers={providers}
        isOpen={providerModalOpen}
        handleClose={() => setProviderModalOpen(false)}
        saveCallback={setProviders}
      />

      <Form method="post">
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
            <Tab.Panel className="flex flex-col lg:flex-row gap-7">
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

                  <div className="flex flex-row gap-4 items-center lg:justify-end">
                    <button
                      type="button"
                      className={`border rounded-full ${
                        theme === 'light' ? 'outline outline-indigo-500' : ''
                      } w-7 h-7 overflow-hidden`}
                      onClick={(e) => {
                        e.preventDefault()
                        setTheme('light')
                      }}
                    >
                      <img src={lightIcon} />
                    </button>
                    <button
                      type="button"
                      className={`border rounded-full ${
                        theme === 'dark' ? 'outline outline-indigo-500' : ''
                      } w-7 h-7 overflow-hidden`}
                      onClick={(e) => {
                        e.preventDefault()
                        setTheme('dark')
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
                    onChange={(e) => {
                      setHeading(e.target.value)
                    }}
                    value={heading}
                  />
                </FormElement>

                <FormElement label="Radius">
                  <input
                    id="radius"
                    name="radius"
                    type="hidden"
                    value={radius}
                  />

                  <div className="p-1 border border-gray-300 shadow-sm rounded flex justify-evenly">
                    <RadiusButton
                      radius={'lg'}
                      setRadius={setRadius}
                      selectedRadius={radius}
                    />
                    <RadiusButton
                      radius={'md'}
                      setRadius={setRadius}
                      selectedRadius={radius}
                    />
                    <RadiusButton
                      radius={'sm'}
                      setRadius={setRadius}
                      selectedRadius={radius}
                    />
                  </div>
                </FormElement>

                <FormElement label="Primary">
                  <Popover className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex justify-center items-center">
                      <Popover.Button
                        className="w-4 h-4 ml-3 rounded"
                        style={{
                          backgroundColor: color,
                        }}
                      ></Popover.Button>
                    </div>

                    <input
                      id="color"
                      name="color"
                      value={color}
                      onChange={(e) => {
                        let val = e.target.value
                        if (!val.startsWith('#')) {
                          val = '#' + val
                        }

                        setColor(val)
                      }}
                      className="pl-9 pr-3 py-2 border border-gray-300 shadow-sm rounded text-sm font-normal text-gray-500 w-full"
                    />

                    <Popover.Panel className="absolute">
                      <HexColorPicker color={color} onChange={setColor} />
                    </Popover.Panel>
                  </Popover>
                </FormElement>

                <FormElement label="Login Screen Side Image">
                  <div className="flex flex-row items-center gap-2">
                    <IconPicker
                      maxSize={2097152}
                      ar={{
                        w: 2,
                        h: 3,
                      }}
                      minW={720}
                      minH={1080}
                      id="image"
                      setIsFormChanged={(val) => {}}
                      setIsImgUploading={(val) => {
                        setLoading(val)
                      }}
                      imageUploadCallback={setGraphicURL}
                      url={graphicURL}
                    />

                    {graphicURL && (
                      <button
                        type="button"
                        className="flex justify-center items-center py-2 px-4"
                        onClick={() => {
                          setGraphicURL(undefined)
                        }}
                      >
                        <Text
                          size="xs"
                          weight="medium"
                          className="text-gray-200"
                        >
                          Remove
                        </Text>
                      </button>
                    )}
                  </div>
                </FormElement>

                <FormElement label="Login Provider Configuration">
                  <Button
                    btnType="secondary-alt"
                    className="flex flex-row items-center gap-2.5"
                    onClick={() => setProviderModalOpen(true)}
                  >
                    <HiCog className="w-4 h-4" />

                    <Text size="sm" weight="medium" className="text-gray-500">
                      Configure
                    </Text>
                  </Button>
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
                        <h1 className={'font-semibold text-xl dark:text-white'}>
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
                  displayKeys={providers
                    .filter((p) => p.enabled)
                    .map((p) => p.key)}
                  mapperArgs={{
                    clientId: 'Foo',
                    wagmiClient: client,
                    signData: null,
                  }}
                  radius={radius}
                  darkMode={theme === 'dark'}
                />
              </section>
            </Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Form>
    </>
  )
}
