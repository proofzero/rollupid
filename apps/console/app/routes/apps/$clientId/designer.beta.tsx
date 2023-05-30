import { Popover, Tab } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'
import { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { IconType } from 'react-icons'
import { HiCog, HiOutlineCog, HiOutlineMail } from 'react-icons/hi'
import { DocumentationBadge } from '~/components/DocumentationBadge'

import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import Authentication, {
  AuthenticationScreenDefaults,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

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
import {
  AppTheme,
  AppThemeSchema,
  EmailOTPTheme,
  EmailOTPThemeSchema,
} from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { ActionFunction, LoaderFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { GetAppThemeResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppTheme'
import Authorization from '@proofzero/design-system/src/templates/authorization/Authorization'
import { SCOPES_JSON } from '@proofzero/security/scopes'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { TbMoon, TbSunHigh } from 'react-icons/tb'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { Helmet } from 'react-helmet'
import { notificationHandlerType } from '~/types'
import InputTextarea from '@proofzero/design-system/src/atoms/form/InputTextarea'
import {
  EmailTemplate,
  darkModeStyles,
  lightModeStyles,
} from '@proofzero/platform/email/emailOtpTemplate'
import subtractLogo from '@proofzero/design-system/src/assets/subtract-logo.svg'
import { BadRequestError } from '@proofzero/errors'
import { GetEmailOTPThemeResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getEmailOTPTheme'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getEmailIcon, adjustAddressTypeToDisplay } from '@proofzero/utils/getNormalisedConnectedAccounts'

const getRGBColor = (hex: string, type: string) => {
  let color = hex.replace(/#/g, '')
  // rgb values
  var r = parseInt(color.substr(0, 2), 16)
  var g = parseInt(color.substr(2, 2), 16)
  var b = parseInt(color.substr(4, 2), 16)

  return `--color-${type}: ${r}, ${g}, ${b};`
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
    className={`box-border -mb-0.5 mr-8 pb-4 px-1 flex flex-row items-center gap-2 border-b-2 ${selected ? 'border-indigo-600' : 'border-transparent'
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

const AuthCompTab = ({ selected }: { selected: boolean }) => {
  const { dark, theme } = useContext(ThemeContext)

  return (
    <div
      className={`w-2 h-2 rounded-full`}
      style={{
        backgroundColor: selected
          ? !dark
            ? theme?.color?.light
            : theme?.color?.dark
          : '#E5E7EB',
      }}
    ></div>
  )
}

const FormElement = ({
  label,
  sublabel,
  children,
}: {
  label: string
  sublabel?: string
  children: ReactNode
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center px-8 py-4">
      <div className="flex-1 mb-2 lg:mb-0">
        <Text size="sm" weight="medium" className="text-gray-900">
          {label}
        </Text>

        {sublabel && (
          <Text size="xs" weight="normal" className="text-gray-500">
            {sublabel}
          </Text>
        )}
      </div>

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
      throw new BadRequestError({ message: 'Invalid radius' })
  }

  const selected = selectedRadius === radius

  return (
    <button
      type="button"
      className={`w-full py-1.5 px-2.5 rounded-md ${selected ? 'bg-indigo-500' : ''
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
  onClose,
  saveCallback,
}: {
  providers: {
    key: string
    enabled: boolean
  }[]
  isOpen: boolean
  onClose: (val: boolean) => void
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
    <Modal isOpen={isOpen} fixed handleClose={() => onClose(false)}>
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
              onClose(true)
            }}
          >
            Save
          </Button>
          <Button btnType="secondary-alt" onClick={() => onClose(true)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

const AuthPanel = ({
  appTheme,
  avatarURL,
  setLoading,
  errors,
}: {
  appTheme?: AppTheme
  avatarURL: string
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  errors?: {
    [key: string]: string
  }
}) => {
  const [dark, setDark] = useState<boolean>(false)
  const toggleDark = () => setDark(!dark)

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

  const [providers, setProviders] = useState<
    {
      key: string
      enabled: boolean
    }[]
  >(
    appTheme?.providers ??
    AuthenticationScreenDefaults.knownKeys.map((k) => ({
      key: k,
      enabled: true,
    }))
  )
  const [providerModalOpen, setProviderModalOpen] = useState<boolean>(false)

  return (
    <>
      <Helmet>
        <style type="text/css">{`
            :root {
                ${getRGBColor(dark ? color.dark : color.light, 'primary')}   
             {
         `}</style>
      </Helmet>

      <ProviderModal
        providers={providers}
        isOpen={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        saveCallback={setProviders}
      />
      <Tab.Panel className="flex flex-col lg:flex-row gap-7">
        <input type="hidden" name="target" value="auth" />

        <section className="flex-1 bg-white border rounded-lg">
          <Text size="lg" weight="semibold" className="mx-8 my-4 text-gray-900">
            Login Settings
          </Text>

          <FormElement label="Heading">
            <Input
              id={'heading'}
              label={''}
              placeholder={AuthenticationScreenDefaults.defaultHeading}
              onChange={(e) => {
                setHeading(e.target.value)
              }}
              value={heading}
              error={errors && errors['heading']}
            />

            {errors && errors['heading'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors['heading']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Radius">
            <input id="radius" name="radius" type="hidden" value={radius} />

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

            {errors && errors['radius'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors && errors['radius']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Primary Color" sublabel="Buttons & Links">
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
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
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

            {errors && errors['color.light'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors['color.light']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement
            label="Primary Color - Darkmode"
            sublabel="Buttons & Links"
          >
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
                id="colordark"
                name="colordark"
                value={color.dark}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
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

            {errors && errors['color.dark'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors['color.light']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement
            label="Login Screen Side Image"
            sublabel="2:3 ratio (at least 720x1080px), images can't be larger than 2mB"
          >
            <div className="flex flex-row items-center gap-2">
              <IconPicker
                maxSize={2097152}
                aspectRatio={{
                  width: 2,
                  height: 3,
                }}
                minWidth={720}
                minHeight={1080}
                id="image"
                setIsFormChanged={(val) => { }}
                setIsImgUploading={(val) => {
                  setLoading(val)
                }}
                imageUploadCallback={setGraphicURL}
                url={graphicURL}
                invalid={errors && errors['graphicURL'] ? true : false}
                errorMessage={
                  errors && errors['graphicURL'] ? errors['graphicURL'] : ''
                }
              />

              {graphicURL && (
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4"
                  onClick={() => {
                    setGraphicURL(undefined)
                  }}
                >
                  <Text size="xs" weight="medium" className="text-gray-200">
                    Remove
                  </Text>
                </button>
              )}
            </div>
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

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

          <div className="w-full border-b border-gray-200"></div>
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
                          src={AuthenticationScreenDefaults.defaultLogoURL}
                          size="sm"
                        ></Avatar>
                        <div className={'flex flex-col items-center gap-2'}>
                          <h1
                            className={'font-semibold text-xl dark:text-white'}
                          >
                            {heading ??
                              AuthenticationScreenDefaults.defaultHeading}
                          </h1>

                          <h2
                            style={{ color: '#6B7280' }}
                            className={'font-medium text-base'}
                          >
                            {AuthenticationScreenDefaults.defaultSubheading}
                          </h2>
                        </div>
                      </>
                    }
                    displayKeys={providers
                      .filter((p) => p.enabled)
                      .map((p) => p.key)}
                    mapperArgs={{
                      clientId: 'Foo',
                      signData: null,
                    }}
                    radius={radius}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <Authorization
                    userProfile={{
                      pfpURL: avatarURL,
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
                    connectedEmails={[
                      {
                        title: 'email@example.com',
                        icon: getEmailIcon(EmailAddressType.Email),
                        value:
                          'urn:rollupid:address/0xc2b930f1fc2a55ddc1bf89e8844ca0479567ac44f3e2eea58216660e26947686',
                      },
                      {
                        title: 'email2@example.com',
                        icon: getEmailIcon(OAuthAddressType.Microsoft),
                        value:
                          'urn:rollupid:address/0xc2b930f1fc2a55ddc1bf99e8844ca0479567ac44f3e2eea58216660e26947686',
                      },
                    ]}
                    selectEmailCallback={() => { }}
                    addNewEmailCallback={() => { }}
                    connectedAccounts={[
                      {
                        title: 'email@example.com',
                        subtitle: `${adjustAddressTypeToDisplay(EmailAddressType.Email)} - email@example.com`,
                        value: 'urn:rollupid:address/0x98f8b8473269c7e4444756d5ecef7dce5457a5d58df4100b46478402f59de57c',
                      },
                      {
                        title: 'MS Email',
                        subtitle: `${adjustAddressTypeToDisplay(OAuthAddressType.Microsoft)} - email2@example.com`,
                        value: 'urn:rollupid:address/0x3c7d7e3fef81c03333ed63d4ac83d2a1840356122163985deb1615e6ecfc25be',
                      },
                      {
                        title: 'Github',
                        subtitle: `${adjustAddressTypeToDisplay(OAuthAddressType.GitHub)} - Github-Account`,
                        value: 'urn:rollupid:address/0xa69240d7b361e122d22aa68ff97b9530c7c85953fba9dac392ca8dbfb88e17cc',
                      },
                      {
                        title: 'ens.eth',
                        subtitle: `${adjustAddressTypeToDisplay(CryptoAddressType.ETH)} - 0x6c60Da9471181Aa54C648c6e203663A5501363F3`,
                        value: 'urn:rollupid:address/0x4416ad52d0d65d4b8852b8041039822e92ff4aa301af1b3ab987bd930f6fb4c8',
                      },
                    ]}
                    connectedSmartContractWallets={[]}
                    addNewAccountCallback={() => { }}
                    addNewSmartWalletCallback={() => { }}
                    selectSmartWalletsCallback={() => { }}
                    selectAccountsCallback={() => { }}
                    selectAllAccountsCallback={() => { }}
                    selectAllSmartWalletsCallback={() => { }}
                    // disableAuthorize={true}
                    transitionState={'idle'}
                    cancelCallback={() => { }}
                    authorizeCallback={() => { }}
                    radius={radius}
                  />
                </Tab.Panel>
              </Tab.Panels>

              <Tab.List className="flex flex-row justify-center items-center items-center mt-6 gap-1.5">
                <Tab className="outline-0">
                  {({ selected }) => <AuthCompTab selected={selected} />}
                </Tab>

                <Tab className="outline-0">
                  {({ selected }) => <AuthCompTab selected={selected} />}
                </Tab>
              </Tab.List>
            </Tab.Group>
          </ThemeContext.Provider>
        </section>
      </Tab.Panel>
    </>
  )
}

const EmailPanel = ({
  emailTheme,
  setLoading,
  errors,
}: {
  emailTheme?: EmailOTPTheme
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  errors?: {
    [key: string]: string
  }
}) => {
  const [logoURL, setLogoURL] = useState<string | undefined>(
    emailTheme?.logoURL
  )
  const [address, setAddress] = useState<string | undefined>(
    emailTheme?.address
  )
  const [contact, setContact] = useState<string | undefined>(
    emailTheme?.contact
  )

  const iFrameRef = useRef<HTMLIFrameElement>(null)
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(darkMode.matches)
  }, [])

  useEffect(() => {
    if (!iFrameRef) return

    var iframeDoc = iFrameRef.current?.contentWindow?.document
    console.log({ iframeDoc })
    if (!iframeDoc) return

    const styleId = 'injected-styles'

    var newStyle = document.createElement('style')
    newStyle.id = styleId
    newStyle.innerHTML = dark ? darkModeStyles : lightModeStyles

    iframeDoc.getElementById(styleId)?.remove()

    iframeDoc.head.appendChild(newStyle)
  }, [dark])

  const toggleTheme = () => {
    setDark(!dark)
  }

  return (
    <Tab.Panel className="flex flex-col lg:flex-row gap-7">
      <input type="hidden" name="target" value="email" />

      <section className="flex-1 bg-white border rounded-lg">
        <Text size="lg" weight="semibold" className="mx-8 my-4 text-gray-900">
          OTP Email Settings
        </Text>

        <FormElement label="Logo" sublabel="Images can't be larger than 2mB">
          <div className="flex flex-row items-center gap-2">
            <IconPicker
              maxSize={2097152}
              aspectRatio={{
                width: 1,
                height: 1,
              }}
              id="logoURL"
              setIsFormChanged={(val) => { }}
              setIsImgUploading={(val) => {
                setLoading(val)
              }}
              imageUploadCallback={setLogoURL}
              url={logoURL}
              invalid={errors && errors['email.logoURL'] ? true : false}
              errorMessage={
                errors && errors['email.logoURL'] ? errors['email.logoURL'] : ''
              }
            />

            {logoURL && (
              <button
                type="button"
                className="flex justify-center items-center py-2 px-4"
                onClick={() => {
                  setLogoURL(undefined)
                }}
              >
                <Text size="xs" weight="medium" className="text-gray-200">
                  Remove
                </Text>
              </button>
            )}
          </div>
        </FormElement>

        <FormElement label="Business Address">
          <InputTextarea
            id="address"
            heading=""
            defaultValue={address}
            onChange={setAddress}
            error={errors && errors['email.address'] ? true : false}
          />

          {errors && errors['email.address'] && (
            <Text
              className="mb-1.5 mt-1.5 text-red-500"
              size="xs"
              weight="normal"
            >
              {errors['email.address']}
            </Text>
          )}
        </FormElement>

        <FormElement label="Contact us">
          <Input
            id={'contact'}
            label={''}
            onChange={(e) => {
              setContact(e.target.value)
            }}
            value={contact}
            error={errors && errors['email.contact']}
          />

          {errors && errors['email.contact'] && (
            <Text
              className="mb-1.5 mt-1.5 text-red-500"
              size="xs"
              weight="normal"
            >
              {errors['email.contact']}
            </Text>
          )}
        </FormElement>
      </section>

      <section className="bg-white border rounded-lg pb-3 px-6 min-w-[468px] h-[781px] overflow-scroll">
        <div className="flex flex-row items-center justify-between my-4">
          <Text size="lg" weight="semibold" className="text-gray-900">
            Preview
          </Text>

          <div className="flex flex-row gap-2 items-center">
            <TbSunHigh />
            <InputToggle
              id="otp-theme"
              label=""
              onToggle={toggleTheme}
              checked={dark}
            />
            <TbMoon />
          </div>
        </div>

        <iframe
          ref={iFrameRef}
          className="w-full border rounded-lg"
          srcDoc={
            EmailTemplate('XXXXXX', {
              logoURL:
                logoURL ??
                'https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/70676dfd-2899-4556-81ef-e5f48f5eb900/public',
              privacyURL: '#',
              termsURL: '#',
              contactURL: contact,
              address: address,
            }).body
          }
          onLoad={(ev) => {
            const iFrame = ev.target as HTMLIFrameElement
            const iFrameDoc = iFrame.contentDocument

            const height = iFrameDoc?.body.clientHeight
            if (!height) {
              console.warn('No height detected for iFrame')
              return
            }

            iFrame.style.height = height + 0.05 * height + 'px'
          }}
        ></iframe>
      </section>
    </Tab.Panel>
  )
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Client ID is required for the requested route',
      })
    }

    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const clientId = params?.clientId

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appTheme = await starbaseClient.getAppTheme.query({
      clientId,
    })

    const emailTheme = await starbaseClient.getEmailOTPTheme.query({
      clientId,
    })

    return json({
      appTheme,
      emailTheme,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Client ID is required for the requested route',
      })
    }

    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const clientId = params?.clientId

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let errors: {
      [key: string]: string
    } = {}

    let theme = await starbaseClient.getAppTheme.query({
      clientId,
    })

    let emailTheme = await starbaseClient.getEmailOTPTheme.query({
      clientId,
    })

    const updateAuth = async (fd: FormData, theme: AppTheme) => {
      let heading = fd.get('heading') as string | undefined
      if (!heading || heading === '') heading = undefined

      let radius = fd.get('radius') as string | undefined
      if (!radius || radius === '') radius = undefined

      let color = fd.get('color') as string | undefined
      if (!color || color === '') color = undefined

      let colorDark = fd.get('colordark') as string | undefined
      if (!colorDark || colorDark === '') colorDark = undefined

      let graphicURL = fd.get('image') as string | undefined
      if (!graphicURL || graphicURL === '') graphicURL = undefined

      let providersJSON = fd.get('providers') as string | undefined
      if (!providersJSON || providersJSON === '') providersJSON = undefined

      const providers = providersJSON ? JSON.parse(providersJSON) : undefined

      theme = {
        ...theme,
        heading: heading ?? theme?.heading,
        radius: radius ?? theme?.radius,
        color:
          color && colorDark
            ? {
              light: color,
              dark: colorDark,
            }
            : theme?.color,
        graphicURL: graphicURL ?? theme?.graphicURL,
        providers: providers ?? theme?.providers,
      }

      const zodErrors = await AppThemeSchema.spa(theme)
      if (!zodErrors.success) {
        const mappedIssues = zodErrors.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))

        errors = mappedIssues.reduce((acc, curr) => {
          acc[curr.path] = curr.message
          return acc
        }, {} as { [key: string]: string })
      } else {
        await starbaseClient.setAppTheme.mutate({
          clientId,
          theme,
        })
      }

      return json({
        errors,
      })
    }

    const updateEmail = async (fd: FormData, theme: EmailOTPTheme) => {
      let logoURL = fd.get('logoURL') as string | undefined
      if (!logoURL || logoURL === '') logoURL = undefined

      let address = fd.get('address') as string | undefined
      if (!address || address === '') address = undefined

      let contact = fd.get('contact') as string | undefined
      if (!contact || contact === '') contact = undefined

      theme = {
        ...theme,
        logoURL: logoURL ?? theme?.logoURL,
        address: address ?? theme?.address,
        contact: contact ?? theme?.contact,
      }

      const zodErrors = await EmailOTPThemeSchema.spa(theme)
      if (!zodErrors.success) {
        const mappedIssues = zodErrors.error.issues.map((issue) => ({
          path: `email.${issue.path.join('.')}`,
          message: issue.message,
        }))

        errors = mappedIssues.reduce((acc, curr) => {
          acc[curr.path] = curr.message
          return acc
        }, {} as { [key: string]: string })
      } else {
        await starbaseClient.setEmailOTPTheme.mutate({
          clientId,
          theme,
        })
      }

      return json({
        errors,
      })
    }

    const fd = await request.formData()
    switch (fd.get('target')) {
      case 'auth':
        return updateAuth(fd, theme)
      case 'email':
        return updateEmail(fd, emailTheme)
      default:
        throw new BadRequestError({
          message: 'Invalid target',
        })
    }
  }
)

export default () => {
  const { appTheme, emailTheme } = useLoaderData<{
    appTheme: GetAppThemeResult
    emailTheme: GetEmailOTPThemeResult
  }>()

  const actionData = useActionData()
  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
    }
  }, [errors])

  const { avatarUrl, notificationHandler } = useOutletContext<{
    avatarUrl: string
    notificationHandler: notificationHandlerType
  }>()

  const [loading, setLoading] = useState<boolean>(false)

  return (
    <>
      {loading && <Loader />}

      <Form method="post">
        <section className="flex flex-col lg:flex-row items-center justify-between mb-11">
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

          <div className="flex flex-row justify-end items-center gap-2 mt-2 lg:mt-0">
            <Button
              btnType="secondary-alt"
              type="button"
              onClick={() => {
                window.location.reload()
              }}
            >
              Discard
            </Button>
            <Button btnType="primary-alt" type="submit">
              Save
            </Button>
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

            <Tab className="outline-0">
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
            <AuthPanel
              appTheme={appTheme}
              avatarURL={avatarUrl}
              setLoading={setLoading}
              errors={errors}
            />

            <EmailPanel
              emailTheme={emailTheme}
              setLoading={setLoading}
              errors={errors}
            />
          </Tab.Panels>
        </Tab.Group>
      </Form>
    </>
  )
}
