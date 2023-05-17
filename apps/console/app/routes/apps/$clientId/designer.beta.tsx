import { Popover, Tab } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Form, useLoaderData, useOutletContext } from '@remix-run/react'
import { ReactNode, useState } from 'react'
import { IconType } from 'react-icons'
import { HiCog, HiOutlineCog, HiOutlineMail } from 'react-icons/hi'
import { DocumentationBadge } from '~/components/DocumentationBadge'

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
import { GetAppThemeResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppTheme'
import Authorization, {
  scopeIcons,
} from '@proofzero/design-system/src/templates/authorization/Authorization'
import { SCOPES_JSON } from '@proofzero/security/scopes'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { TbMoon, TbSunHigh } from 'react-icons/tb'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { Helmet } from 'react-helmet'

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

  const appTheme = await starbaseClient.getAppThemes.query({
    clientId,
  })

  return json({
    appTheme,
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

  const heading = fd.get('heading') as string
  const radius = fd.get('radius') as string
  const color = fd.get('color') as string
  const colorDark = fd.get('color-dark') as string
  const graphicURL = fd.get('image') as string

  const providersJSON = fd.get('providers') as string
  const providers = JSON.parse(providersJSON)

  const theme: AppTheme = {
    heading,
    radius,
    color: {
      light: color,
      dark: colorDark,
    },
    graphicURL,
    providers,
  }

  await starbaseClient.setAppTheme.mutate({
    clientId,
    theme,
  })

  return null
}

export default () => {
  const { appTheme } = useLoaderData<{
    appTheme: GetAppThemeResult
  }>()

  const { avatarUrl } = useOutletContext<{
    avatarUrl: string
  }>()

  const [heading, setHeading] = useState<string>(appTheme?.heading ?? '')
  const [radius, setRadius] = useState<string>(appTheme?.radius ?? 'md')

  const [color, setColor] = useState<{
    light: string
    dark: string
  }>(
    appTheme?.color ?? {
      light: '#6366F1',
      dark: '#C6C7FF',
    }
  )

  const [graphicURL, setGraphicURL] = useState<string | undefined>(
    appTheme?.graphicURL
  )

  const [loading, setLoading] = useState<boolean>(false)

  const [providers, setProviders] = useState<
    {
      key: string
      enabled: boolean
    }[]
  >(
    appTheme?.providers ??
      AuthenticationConstants.knownKeys.map((k) => ({
        key: k,
        enabled: true,
      }))
  )
  const [providerModalOpen, setProviderModalOpen] = useState<boolean>(false)

  const [dark, setDark] = useState<boolean>(false)
  const toggleDark = () => setDark(!dark)

  const getRGBColor = (hex: string, type: string) => {
    let color = hex.replace(/#/g, '')
    // rgb values
    var r = parseInt(color.substr(0, 2), 16)
    var g = parseInt(color.substr(2, 2), 16)
    var b = parseInt(color.substr(4, 2), 16)

    return `--color-${type}: ${r}, ${g}, ${b};`
  }

  return (
    <>
      <Helmet>
        <style type="text/css">{`
            :root {
                ${getRGBColor(dark ? color.dark : color.light, 'primary')}   
             {
         `}</style>
      </Helmet>

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

                <FormElement label="Primary Color">
                  <Popover className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex justify-center items-center">
                      <Popover.Button
                        className="w-4 h-4 ml-3 rounded"
                        style={{
                          backgroundColor: color.light,
                        }}
                      ></Popover.Button>
                    </div>

                    <input
                      id="color"
                      name="color"
                      value={color.light}
                      onChange={(e) => {
                        let val = e.target.value
                        if (!val.startsWith('#')) {
                          val = '#' + val
                        }

                        setColor({
                          dark: color.dark,
                          light: val,
                        })
                      }}
                      className="pl-9 pr-3 py-2 border border-gray-300 shadow-sm rounded text-sm font-normal text-gray-500 w-full"
                    />

                    <Popover.Panel className="absolute z-10">
                      <HexColorPicker
                        color={color.light}
                        onChange={(val) => {
                          setColor({
                            dark: color.dark,
                            light: val,
                          })
                        }}
                      />
                    </Popover.Panel>
                  </Popover>
                </FormElement>

                <FormElement label="Primary Color - Darkmode">
                  <Popover className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex justify-center items-center">
                      <Popover.Button
                        className="w-4 h-4 ml-3 rounded"
                        style={{
                          backgroundColor: color.dark,
                        }}
                      ></Popover.Button>
                    </div>

                    <input
                      id="color-dark"
                      name="color-dark"
                      value={color.dark}
                      onChange={(e) => {
                        let val = e.target.value
                        if (!val.startsWith('#')) {
                          val = '#' + val
                        }

                        setColor({
                          light: color.light,
                          dark: val,
                        })
                      }}
                      className="pl-9 pr-3 py-2 border border-gray-300 shadow-sm rounded text-sm font-normal text-gray-500 w-full"
                    />

                    <Popover.Panel className="absolute z-10">
                      <HexColorPicker
                        color={color.dark}
                        onChange={(val) => {
                          setColor({
                            light: color.light,
                            dark: val,
                          })
                        }}
                      />
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
                  <input
                    type="hidden"
                    name="providers"
                    value={JSON.stringify(providers)}
                  />

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

              <section className="bg-white border rounded-lg pb-3 px-6">
                <div className="flex flex-row items-center justify-between my-4">
                  <Text size="lg" weight="semibold" className="text-gray-900">
                    Preview
                  </Text>

                  <div className="flex flex-row gap-2 items-center">
                    <TbSunHigh />
                    <InputToggle id="theme" label="" onToggle={toggleDark} />
                    <TbMoon />
                  </div>
                </div>

                <ThemeContext.Provider
                  value={{
                    dark,
                    theme: {
                      color: {
                        light: color.light,
                        dark: color.dark,
                      },
                      radius: radius,
                    },
                  }}
                >
                  <Tab.Group>
                    <Tab.Panels className="pointer-events-auto">
                      <Tab.Panel>
                        <Authentication
                          Header={
                            <>
                              <Avatar
                                src={AuthenticationConstants.defaultLogoURL}
                                size="sm"
                              ></Avatar>
                              <div
                                className={'flex flex-col items-center gap-2'}
                              >
                                <h1
                                  className={
                                    'font-semibold text-xl dark:text-white'
                                  }
                                >
                                  {heading ??
                                    AuthenticationConstants.defaultHeading}
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
                        />
                      </Tab.Panel>
                      <Tab.Panel>
                        <Authorization
                          userProfile={{
                            pfpURL: avatarUrl,
                          }}
                          appProfile={{
                            name: 'Passport',
                            iconURL:
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
                            privacyURL: 'foo',
                            termsURL: 'bar',
                          }}
                          requestedScope={['email', 'connected_accounts']}
                          scopeMeta={{
                            scopes: SCOPES_JSON,
                          }}
                          scopeIcons={scopeIcons}
                          connectedEmails={[
                            {
                              email: 'email@example.com',
                              type: EmailAddressType.Email,
                              addressURN:
                                'urn:rollupid:address/0xc2b930f1fc2a55ddc1bf89e8844ca0479567ac44f3e2eea58216660e26947686',
                            },
                            {
                              email: 'email2@example.com',
                              type: OAuthAddressType.Microsoft,
                              addressURN:
                                'urn:rollupid:address/0xc2b930f1fc2a55ddc1bf99e8844ca0479567ac44f3e2eea58216660e26947686',
                            },
                          ]}
                          selectEmailCallback={() => {}}
                          addNewEmailCallback={() => {}}
                          connectedAccounts={[
                            {
                              address: 'email@example.com',
                              title: 'email@example.com',
                              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
                              type: EmailAddressType.Email,
                              id: 'urn:rollupid:address/0x98f8b8473269c7e4444756d5ecef7dce5457a5d58df4100b46478402f59de57c',
                            },
                            {
                              address: 'email2@example.com',
                              title: 'MS Email',
                              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
                              type: OAuthAddressType.Microsoft,
                              id: 'urn:rollupid:address/0x3c7d7e3fef81c03333ed63d4ac83d2a1840356122163985deb1615e6ecfc25be',
                            },
                            {
                              address: 'Github-Account',
                              title: 'Github',
                              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
                              type: OAuthAddressType.GitHub,
                              id: 'urn:rollupid:address/0xa69240d7b361e122d22aa68ff97b9530c7c85953fba9dac392ca8dbfb88e17cc',
                            },
                            {
                              address:
                                '0x6c60Da9471181Aa54C648c6e203663A5501363F3',
                              title: 'ens.eth',
                              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA3IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEwNyAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iMTcuODMwOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzgxMDNfMjEwMTApIi8+CjxwYXRoIGQ9Ik02Ny44NjYzIDg2LjgyNDZDODAuMjMwMiA4MS4xMjgzIDg4LjgxMjUgNjguNjI3IDg4LjgxMjUgNTQuMTIxMUM4OC44MTI1IDM0LjI0NTMgNzIuNyAxOC4xMzI4IDUyLjgyNDIgMTguMTMyOEMzMi45NDg0IDE4LjEzMjggMTYuODM1OSAzNC4yNDUzIDE2LjgzNTkgNTQuMTIxMUMxNi44MzU5IDY3LjIyMDkgMjMuODM1MSA3OC42ODU5IDM0LjI5NzcgODQuOTgwN1Y1My45MDgxTDM0LjI5ODkgNTMuOTA5M0MzNC40MTI0IDQzLjc3NSA0Mi42NjMgMzUuNTk0NiA1Mi44MjQyIDM1LjU5NDZDNjMuMDU2MSAzNS41OTQ2IDcxLjM1MDcgNDMuODg5MiA3MS4zNTA3IDU0LjEyMTFDNzEuMzUwNyA2NC4zNTE4IDYzLjA1ODEgNzIuNjQ1NiA1Mi44Mjc5IDcyLjY0NzZMNjcuODY2MyA4Ni44MjQ2WiIgZmlsbD0id2hpdGUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl84MTAzXzIxMDEwIiB4MT0iNTMuNSIgeTE9IjAiIHgyPSI1My41IiB5Mj0iMTA3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzk0NkQwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
                              type: CryptoAddressType.ETH,
                              id: 'urn:rollupid:address/0x4416ad52d0d65d4b8852b8041039822e92ff4aa301af1b3ab987bd930f6fb4c8',
                            },
                          ]}
                          connectedSmartContractWallets={[]}
                          addNewAccountCallback={() => {}}
                          addNewSmartWalletCallback={() => {}}
                          selectSmartWalletCallback={() => {}}
                          selectAccountsCallback={() => {}}
                          // disableAuthorize={true}
                          transitionState={'idle'}
                          cancelCallback={() => {}}
                          authorizeCallback={() => {}}
                          radius={radius}
                        />
                      </Tab.Panel>
                    </Tab.Panels>

                    <Tab.List className="flex flex-row justify-center items-center items-center mt-6 gap-1.5">
                      <Tab className="outline-0">
                        {({ selected }) => (
                          <div
                            className={`w-2 h-2 rounded-full`}
                            style={{
                              backgroundColor: selected
                                ? !dark
                                  ? color.light
                                  : color.dark
                                : '#E5E7EB',
                            }}
                          ></div>
                        )}
                      </Tab>

                      <Tab className="outline-0">
                        {({ selected }) => (
                          <div
                            className={`w-2 h-2 rounded-full`}
                            style={{
                              backgroundColor: selected
                                ? !dark
                                  ? color.light
                                  : color.dark
                                : '#E5E7EB',
                            }}
                          ></div>
                        )}
                      </Tab>
                    </Tab.List>
                  </Tab.Group>
                </ThemeContext.Provider>
              </section>
            </Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Form>
    </>
  )
}
