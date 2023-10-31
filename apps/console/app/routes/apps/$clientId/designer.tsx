import { Popover, Tab } from '@headlessui/react'
import {
  Form,
  Link,
  NavLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'
import {
  ReactNode,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { IconType } from 'react-icons'
import {
  HiCog,
  HiOutlineCog,
  HiOutlineMail,
  HiOutlineX,
  HiOutlineShare,
  HiOutlineExternalLink,
} from 'react-icons/hi'
import { DocumentationBadge } from '~/components/DocumentationBadge'

import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import Authentication, {
  AuthenticationScreenDefaults,
  getDisplayNameFromProviderString,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

import { Avatar } from '@proofzero/packages/design-system/src/atoms/profile/avatar/Avatar'
import IconPicker from '~/components/IconPicker'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { SortableList } from '@proofzero/design-system/src/atoms/lists/SortableList'
import _ from 'lodash'
import {
  getProviderIcons,
  getRGBColor,
  getTextColor,
} from '@proofzero/design-system/src/helpers'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { HexColorPicker } from 'react-colorful'
import {
  AppTheme,
  AppThemeSchema,
  EmailOTPTheme,
  EmailOTPThemeSchema,
  OGTheme,
  OGThemeSchema,
} from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import {
  ActionFunction,
  AppLoadContext,
  LoaderFunction,
  json,
} from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { GetAppThemeResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppTheme'
import Authorization from '@proofzero/design-system/src/templates/authorization/Authorization'
import { SCOPES_JSON } from '@proofzero/security/scopes'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import { TbMoon, TbSunHigh } from 'react-icons/tb'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { Helmet } from 'react-helmet'
import { notificationHandlerType } from '~/types'
import InputTextarea from '@proofzero/design-system/src/atoms/form/InputTextarea'
import {
  EmailTemplateOTP,
  darkModeStyles,
  lightModeStyles,
} from '@proofzero/platform/email/emailTemplate'
import { BadRequestError } from '@proofzero/errors'
import { GetEmailOTPThemeResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getEmailOTPTheme'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  getEmailIcon,
  adjustAccountTypeToDisplay,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import type { appDetailsProps } from '~/types'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { AccountURN } from '@proofzero/urns/account'
import danger from '~/images/danger.svg'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import classNames from 'classnames'
import { ServicePlanType } from '@proofzero/types/billing'
import designerSVG from '~/assets/early/designer.webp'
import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import { IdentityURN } from '@proofzero/urns/identity'
import { GetOgThemeResult } from '@proofzero/platform.starbase/src/jsonrpc/methods/getOgTheme'
import createImageClient from '@proofzero/platform-clients/image'

const LazyAuth = lazy(() =>
  // @ts-ignore :(
  import('../../../web3/lazyAuth').then((module) => ({
    default: module.LazyAuth,
  }))
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
    case 'xl':
      label = 'Large'
      break
    case 'lg':
      label = 'Medium'
      break
    case 'none':
      label = 'Small'
      break
    default:
      throw new BadRequestError({ message: 'Invalid radius' })
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
  onClose,
  saveCallback,
}: {
  providers: {
    key: string
    val: string
    enabled: boolean
  }[]
  isOpen: boolean
  onClose: (val: boolean) => void
  saveCallback: (
    providers: { key: string; val: string; enabled: boolean }[]
  ) => void
}) => {
  const [selectedProviders, setSelectedProviders] = useState(providers)

  return (
    <Modal isOpen={isOpen} handleClose={() => onClose(false)}>
      <div className="bg-white rounded-lg p-6 min-w-full lg:w-[543px] lg:m-auto">
        <div className="flex flex-row items-center justify-between mb-4 w-full">
          <Text weight="semibold" className="text-left text-gray-800">
            Login Provider Configuration
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              onClose(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        <section className="max-h-[65vh] overflow-y-scroll">
          <SortableList
            items={selectedProviders}
            itemRenderer={(item) => (
              <div className="flex flex-row gap-5 w-full items-center">
                <img className="h-8 w-8" src={getProviderIcons(item.key)} />

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
  appName,
  appTheme,
  avatarURL,
  appIconURL,
  authorizationURL,
  appPublished,
  setLoading,
  errors,
}: {
  appName: string
  appTheme?: AppTheme
  avatarURL: string
  appIconURL?: string
  authorizationURL: string
  appPublished: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  errors?: {
    [key: string]: string
  }
}) => {
  const [dark, setDark] = useState<boolean>(false)
  const toggleDark = () => setDark(!dark)

  const [heading, setHeading] = useState<string>(
    appTheme?.heading ?? AuthenticationScreenDefaults.defaultHeading
  )

  const [signMessage, setSignMessage] = useState<string>(
    appTheme?.signMessageTemplate ??
      AuthenticationScreenDefaults.defaultSignMessage
  )

  const [radius, setRadius] = useState<string>(
    appTheme?.radius ?? AuthenticationScreenDefaults.radius
  )

  const [color, setColor] = useState<{
    light: string
    dark: string
  }>(appTheme?.color ?? AuthenticationScreenDefaults.color)

  const [graphicURL, setGraphicURL] = useState<string | undefined>(
    appTheme?.graphicURL
  )

  const diffOfProviders = AuthenticationScreenDefaults.knownKeys
    .filter((k) => !appTheme?.providers?.some((v) => v.key === k))
    .map((k) => ({
      key: k,
      val: getDisplayNameFromProviderString(k),
      enabled: true,
    }))

  const [providers, setProviders] = useState<
    {
      key: string
      val: string
      enabled: boolean
    }[]
  >(
    appTheme?.providers?.concat(diffOfProviders).map((p) => ({
      ...p,
      val: getDisplayNameFromProviderString(p.key),
    })) ??
      AuthenticationScreenDefaults.knownKeys.map((k) => ({
        key: k,
        val: getDisplayNameFromProviderString(k),
        enabled: true,
      }))
  )
  const [providerModalOpen, setProviderModalOpen] = useState<boolean>(false)

  const resetToDefaults = () => {
    setHeading(AuthenticationScreenDefaults.defaultHeading)
    setSignMessage(AuthenticationScreenDefaults.defaultSignMessage)
    setRadius(AuthenticationScreenDefaults.radius)
    setColor(AuthenticationScreenDefaults.color)
    setGraphicURL(undefined)
    setProviders(
      AuthenticationScreenDefaults.knownKeys.map((k) => ({
        key: k,
        val: getDisplayNameFromProviderString(k),
        enabled: true,
      }))
    )
  }

  const previewAuth = () => {
    const authURL = new URL(authorizationURL)
    authURL.searchParams.set('rollup_action', 'preview')

    window.open(authURL.toString(), '_blank')
  }

  return (
    <>
      <Helmet>
        <style type="text/css">{`
            :root {
                ${getRGBColor(dark ? color.dark : color.light, 'primary')}
                ${getRGBColor(
                  getTextColor(dark ? color.dark : color.light),
                  'primary-contrast-text'
                )}
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

          <FormElement label="Wallet Signature Request Sign Message">
            <InputTextarea
              id={'signMessage'}
              heading=""
              value={signMessage}
              onChange={(val) => setSignMessage(val)}
              rows={5}
            />

            {errors && errors['signMessageTemplate'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors['signMessageTemplate']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Radius">
            <input id="radius" name="radius" type="hidden" value={radius} />

            <div className="p-1 border border-gray-300 shadow-sm rounded flex justify-evenly">
              <RadiusButton
                radius={'xl'}
                setRadius={setRadius}
                selectedRadius={radius}
              />
              <RadiusButton
                radius={'lg'}
                setRadius={setRadius}
                selectedRadius={radius}
              />
              <RadiusButton
                radius={'none'}
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
                maxLength={7}
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
                className="pl-9 pr-3 py-2 border border-gray-300 shadow-sm rounded text-sm font-normal text-gray-500 w-full uppercase"
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
                maxLength={7}
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
                className="pl-9 pr-3 py-2 border border-gray-300 shadow-sm rounded text-sm font-normal text-gray-500 w-full uppercase"
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
            sublabel="2:3 ratio is recommended (at least 720x1080px). Max image size is 2mB"
          >
            <div className="flex flex-row items-center gap-2">
              <IconPicker
                maxSize={2097152}
                id="image"
                setIsFormChanged={(val) => {}}
                setIsImgUploading={(val) => {
                  setLoading(val)
                }}
                imageUploadCallback={setGraphicURL}
                url={graphicURL}
                invalid={errors && errors['graphicURL'] ? true : false}
                errorMessage={
                  errors && errors['graphicURL'] ? errors['graphicURL'] : ''
                }
                variant="PassportAppCover"
              />

              {graphicURL && (
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4"
                  onClick={() => {
                    setGraphicURL(undefined)
                  }}
                >
                  <Text size="xs" weight="medium" className="text-indigo-500">
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

          <FormElement
            label="Live Preview Mode"
            sublabel={
              appPublished ? undefined : `Application has to be published`
            }
          >
            <button
              className="flex flex-row items-center gap-2"
              type="button"
              onClick={previewAuth}
              disabled={!appPublished}
            >
              <Text
                size="sm"
                weight="normal"
                className={classNames(
                  { 'text-indigo-600': appPublished },
                  { 'text-gray-300': !appPublished }
                )}
              >
                Open in new tab
              </Text>

              <HiOutlineExternalLink
                className={classNames(
                  { 'text-indigo-600': appPublished },
                  { 'text-gray-300': !appPublished }
                )}
              />
            </button>
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Default Style Settings">
            <button
              type="button"
              onClick={() => {
                resetToDefaults()
              }}
            >
              <Text size="sm" weight="normal" className="text-indigo-600">
                Reset to default
              </Text>
            </button>
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
                  <LazyAuth>
                    <Authentication
                      Header={
                        <>
                          <Avatar
                            src={
                              appIconURL ??
                              AuthenticationScreenDefaults.defaultLogoURL
                            }
                            size="sm"
                          ></Avatar>
                          <div className={'flex flex-col items-center gap-2'}>
                            <h1
                              className={
                                'font-semibold text-xl dark:text-white text-center'
                              }
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
                        signMessageTemplate: signMessage,
                        clientId: 'Foo',
                        signData: null,
                        authnQueryParams: '',
                      }}
                    />
                  </LazyAuth>
                </Tab.Panel>
                <Tab.Panel className={classNames({ dark })}>
                  <Authorization
                    userProfile={{
                      pfpURL: avatarURL,
                    }}
                    appProfile={{
                      name: appName,
                      iconURL:
                        appIconURL ??
                        AuthenticationScreenDefaults.defaultLogoURL,
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
                        icon: getEmailIcon(EmailAccountType.Email),
                        value:
                          'urn:rollupid:account/0xc2b930f1fc2a55ddc1bf89e8844ca0479567ac44f3e2eea58216660e26947686',
                      },
                      {
                        title: 'email2@example.com',
                        icon: getEmailIcon(OAuthAccountType.Microsoft),
                        value:
                          'urn:rollupid:account/0xc2b930f1fc2a55ddc1bf99e8844ca0479567ac44f3e2eea58216660e26947686',
                      },
                    ]}
                    selectEmailCallback={() => {}}
                    addNewEmailCallback={() => {}}
                    selectedConnectedAccounts={[]}
                    connectedAccounts={[
                      {
                        title: 'email@example.com',
                        subtitle: `${adjustAccountTypeToDisplay(
                          EmailAccountType.Email
                        )} - email@example.com`,
                        value:
                          'urn:rollupid:account/0x98f8b8473269c7e4444756d5ecef7dce5457a5d58df4100b46478402f59de57c',
                      },
                      {
                        title: 'MS Email',
                        subtitle: `${adjustAccountTypeToDisplay(
                          OAuthAccountType.Microsoft
                        )} - email2@example.com`,
                        value:
                          'urn:rollupid:account/0x3c7d7e3fef81c03333ed63d4ac83d2a1840356122163985deb1615e6ecfc25be',
                      },
                      {
                        title: 'Github',
                        subtitle: `${adjustAccountTypeToDisplay(
                          OAuthAccountType.GitHub
                        )} - Github-Account`,
                        value:
                          'urn:rollupid:account/0xa69240d7b361e122d22aa68ff97b9530c7c85953fba9dac392ca8dbfb88e17cc',
                      },
                      {
                        title: 'ens.eth',
                        subtitle: `${adjustAccountTypeToDisplay(
                          CryptoAccountType.ETH
                        )} - 0x6c60Da9471181Aa54C648c6e203663A5501363F3`,
                        value:
                          'urn:rollupid:account/0x4416ad52d0d65d4b8852b8041039822e92ff4aa301af1b3ab987bd930f6fb4c8',
                      },
                    ]}
                    selectedSCWallets={[]}
                    connectedSmartContractWallets={[]}
                    addNewAccountCallback={() => {}}
                    addNewSmartWalletCallback={() => {}}
                    selectSmartWalletsCallback={() => {}}
                    selectAccountsCallback={() => {}}
                    selectAllAccountsCallback={() => {}}
                    selectAllSmartWalletsCallback={() => {}}
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
  clientId,
  accountURN,
  appContactEmail,
  appPublished = false,
  emailTheme,
  setLoading,
  errors,
  passportURL,
}: {
  clientId: string
  accountURN?: AccountURN
  appContactEmail?: string
  appPublished: boolean
  emailTheme?: EmailOTPTheme
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  errors?: {
    [key: string]: string
  }
  passportURL: string
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

  const [localErrors, setLocalErrors] = useState<{
    [key: string]: string
  }>()

  const iFrameRef = useRef<HTMLIFrameElement>(null)
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(darkMode.matches)
  }, [])

  useEffect(() => {
    setLocalErrors(errors)
  }, [errors])

  useEffect(() => {
    if (!iFrameRef) return

    var iframeDoc = iFrameRef.current?.contentWindow?.document
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

  const [previewEmailErrorMessage, setPreviewEmailErrorMessage] = useState<
    string | undefined
  >(undefined)
  const [showTimer, setShowTimer] = useState<boolean>(false)

  const previewEmailFetcher = useFetcher()
  useEffect(() => {
    setLocalErrors(undefined)

    if (previewEmailFetcher.data?.code === 'BAD_REQUEST') {
      setPreviewEmailErrorMessage(previewEmailFetcher.data?.message)
      setShowTimer(true)

      setTimeout(() => {
        setPreviewEmailErrorMessage(undefined)
      }, 15000)
    } else {
      if (previewEmailFetcher.data?.errors) {
        setLocalErrors(previewEmailFetcher.data?.errors)
      } else if (previewEmailFetcher.type === 'done') {
        toast(
          ToastType.Success,
          { message: 'Email Sent! Please check your inbox.' },
          {
            duration: 2000,
          }
        )
      }
    }
  }, [previewEmailFetcher])

  return (
    <>
      {previewEmailFetcher.state !== 'idle' && <Loader />}

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
                id="logoURL"
                setIsFormChanged={(val) => {}}
                setIsImgUploading={(val) => {
                  setLoading(val)
                }}
                imageUploadCallback={setLogoURL}
                url={logoURL}
                invalid={
                  localErrors && localErrors['email.logoURL'] ? true : false
                }
                errorMessage={
                  localErrors && localErrors['email.logoURL']
                    ? localErrors['email.logoURL']
                    : ''
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

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Business Address">
            <InputTextarea
              id="address"
              heading=""
              value={address ?? ''}
              onChange={setAddress}
              error={localErrors && localErrors['email.address'] ? true : false}
            />

            {localErrors && localErrors['email.address'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {localErrors['email.address']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Contact us">
            <Input
              id={'contact'}
              label={''}
              onChange={(e) => {
                setContact(e.target.value)
              }}
              value={contact}
              error={localErrors && localErrors['email.contact']}
            />

            {localErrors && localErrors['email.contact'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {localErrors['email.contact']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <div className="flex flex-col lg:flex-row lg:items-center px-8 py-4">
            <div className="flex-1 mb-2 lg:mb-0 flex flex-row items-center gap-4">
              {(!appContactEmail || !appPublished) && (
                <img className="w-8 h-8" src={danger} alt="danger" />
              )}

              <div>
                <Text size="sm" weight="medium" className="text-gray-900">
                  OTP Preview
                </Text>

                <div className="flex-1">
                  <Text size="xs" weight="normal" className="text-gray-500">
                    {appContactEmail && appPublished && (
                      <Text
                        size="xs"
                        weight="normal"
                        className="text-gray-500"
                      >{`Sends email to "${appContactEmail}"`}</Text>
                    )}
                    {!appContactEmail && (
                      <Text size="xs" weight="normal" className="text-gray-500">
                        Please connect email in{' '}
                        <Link to={`/apps/${clientId}/team`}>
                          <Text
                            type="span"
                            size="xs"
                            weight="normal"
                            className="text-indigo-500"
                          >
                            Team & Contact
                          </Text>
                        </Link>
                      </Text>
                    )}
                    {!appPublished && (
                      <Text size="xs" weight="normal" className="text-gray-500">
                        Please publish app in{' '}
                        <Link to={`/apps/${clientId}/auth`}>
                          <Text
                            type="span"
                            size="xs"
                            weight="normal"
                            className="text-indigo-500"
                          >
                            OAuth
                          </Text>
                        </Link>
                      </Text>
                    )}
                  </Text>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-row items-center gap-4 justify-end">
                {showTimer && (
                  <CountdownCircleTimer
                    size={16}
                    strokeWidth={2}
                    isPlaying
                    duration={15}
                    rotation={'counterclockwise'}
                    colors={'#6366f1'}
                    isGrowing={true}
                    onComplete={() => {
                      setShowTimer(false)
                      setPreviewEmailErrorMessage(undefined)
                      setLocalErrors(undefined)
                    }}
                  />
                )}

                <Button
                  type="button"
                  btnType="secondary-alt"
                  btnSize="xs"
                  onClick={() => {
                    setPreviewEmailErrorMessage(undefined)
                    setLocalErrors(undefined)

                    let previewTheme: EmailOTPTheme = {
                      logoURL:
                        logoURL ??
                        'https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/70676dfd-2899-4556-81ef-e5f48f5eb900/public',
                      address: address,
                      contact: contact,
                    }

                    previewEmailFetcher.submit(
                      {
                        accountURN: accountURN!,
                        theme: JSON.stringify(previewTheme),
                      },
                      {
                        method: 'post',
                        action: `/apps/${clientId}/designer/otp/preview`,
                      }
                    )
                  }}
                  disabled={showTimer || !appContactEmail || !appPublished}
                >
                  <div className="flex flex-row items-center gap-2">
                    <HiOutlineMail className="w-3.5 h-3.5" />{' '}
                    <Text size="sm">Send Preview</Text>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {previewEmailErrorMessage && (
            <Text size="xs" className="text-red-500 px-8">
              {previewEmailErrorMessage}
            </Text>
          )}
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
              EmailTemplateOTP(
                'XXXXXX',
                clientId,
                appContactEmail ?? 'test@email.com',
                'none',
                passportURL,
                {
                  appName: 'Designer',
                  logoURL:
                    logoURL ??
                    'https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/70676dfd-2899-4556-81ef-e5f48f5eb900/public',
                  privacyURL: '#',
                  termsURL: '#',
                  contactURL: contact,
                  address: address,
                },
                true
              ).body
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
    </>
  )
}

const OGPanel = ({
  errors,
  setLoading,
  ogTheme,
  hostname,
}: {
  errors?: {
    [key: string]: string
  }
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ogTheme?: OGTheme
  hostname?: string
}) => {
  const [localErrors, setLocalErrors] = useState<{
    [key: string]: string
  }>()

  const [ogImageURL, setOgImageURL] = useState<string | undefined>(
    ogTheme?.image
  )

  const [ogDescription, setOgDescription] = useState<string | undefined>(
    ogTheme?.description
  )

  const [ogTitle, setOgTitle] = useState<string | undefined>(ogTheme?.title)

  useEffect(() => {
    setLocalErrors(errors)
  }, [errors])

  return (
    <>
      <Tab.Panel className="flex flex-col lg:flex-row gap-7">
        <input type="hidden" name="target" value="og" />

        <section className="flex-1 bg-white border rounded-lg h-max">
          <Text size="lg" weight="semibold" className="mx-8 my-4 text-gray-900">
            Open Graph Settings
          </Text>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Open Graph Title">
            <Input
              id={'ogTitle'}
              label={''}
              placeholder={'Open Graph Title'}
              onChange={(e) => {
                setOgTitle(e.target.value)
              }}
              value={ogTitle}
              error={errors && errors['ogTitle']}
            />

            {errors && errors['ogTitle'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {errors['ogTitle']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement label="Description">
            <InputTextarea
              id="ogDescription"
              heading=""
              placeholder="Open Graph Description"
              value={ogDescription ?? ''}
              onChange={setOgDescription}
              error={
                localErrors && localErrors['OGTheme.description'] ? true : false
              }
            />

            {localErrors && localErrors['ogTheme.description'] && (
              <Text
                className="mb-1.5 mt-1.5 text-red-500"
                size="xs"
                weight="normal"
              >
                {localErrors['ogTheme.description']}
              </Text>
            )}
          </FormElement>

          <div className="w-full border-b border-gray-200"></div>

          <FormElement
            label="Open Graph Image"
            sublabel="1,91:1 ratio (at least 1200x630px) images can't be larger than 2MB"
          >
            <div className="flex flex-row items-center gap-2">
              <IconPicker
                maxSize={2097152}
                id="ogImage"
                setIsFormChanged={(val) => {}}
                setIsImgUploading={(val) => {
                  setLoading(val)
                }}
                imageUploadCallback={setOgImageURL}
                url={ogImageURL}
                invalid={
                  localErrors && localErrors['ogTheme.image'] ? true : false
                }
                errorMessage={
                  localErrors && localErrors['ogTheme.image']
                    ? localErrors['ogTheme.image']
                    : ''
                }
              />

              {ogImageURL && (
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4"
                  onClick={() => {
                    setOgImageURL(undefined)
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
          <FormElement label="Preview OpenGraph Meta Tags">
            <NavLink
              to={`${hostname ? hostname : 'https://passport.rollup.id'}`}
              target="_blank"
              className="text-indigo-500 hover:cursor-pointer hover:underline
             flex flex-row items-center gap-1"
            >
              <Text size="sm">Preview</Text>
              <HiOutlineExternalLink />
            </NavLink>
          </FormElement>
        </section>

        <section className="bg-white border rounded-lg pb-3 px-6 min-w-[468px] h-max overflow-scroll">
          <div className="flex flex-row items-center justify-between my-4">
            <Text size="lg" weight="semibold" className="text-gray-900">
              Preview
            </Text>
          </div>

          {ogTheme?.image ? (
            <img
              src={`${ogTheme?.image}`}
              className="w-full h-[256px] bg-gray-100 rounded-lg object-cover"
              alt="og"
            />
          ) : (
            <div className="w-full h-[256px] bg-gray-100 rounded-lg"></div>
          )}
          <div className="flex-1 mb-2">
            <Text size="lg" weight="semibold" className="text-gray-900 mb-2">
              {ogTheme?.title ? ogTheme.title : 'Open Graph Title'}
            </Text>

            <Text size="xs" weight="normal" className="text-gray-500">
              {ogTheme?.description
                ? ogTheme.description
                : 'Open Graph Description'}
            </Text>
            <Text size="xs" weight="normal" className="text-gray-500">
              {hostname ? hostname : 'https://passport.rollup.id'}
            </Text>
          </div>
        </section>
      </Tab.Panel>
    </>
  )
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Client ID is required for the requested route',
      })
    }

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const clientId = params?.clientId

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appTheme = await coreClient.starbase.getAppTheme.query({
      clientId,
    })

    const emailTheme = await coreClient.starbase.getEmailOTPTheme.query({
      clientId,
    })

    const ogTheme = await coreClient.starbase.getOgTheme.query({
      clientId,
    })

    return json({
      appTheme,
      emailTheme,
      ogTheme,
      passportURL: context.env.PASSPORT_URL,
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

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const clientId = params?.clientId

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let errors: {
      [key: string]: string
    } = {}

    let theme = await coreClient.starbase.getAppTheme.query({
      clientId,
    })

    let emailTheme = await coreClient.starbase.getEmailOTPTheme.query({
      clientId,
    })

    let ogTheme = await coreClient.starbase.getOgTheme.query({
      clientId,
    })

    const updateAuth = async (fd: FormData, theme: AppTheme) => {
      let heading = fd.get('heading') as string | undefined
      if (!heading || heading === '') heading = undefined

      let signMessageTemplate = fd.get('signMessage') as string | undefined
      if (!signMessageTemplate || signMessageTemplate === '')
        signMessageTemplate = undefined

      let radius = fd.get('radius') as string | undefined
      if (!radius || radius === '') radius = undefined

      let color = fd.get('color') as string | undefined
      if (!color || color === '') color = undefined

      let colorDark = fd.get('colordark') as string | undefined
      if (!colorDark || colorDark === '') colorDark = undefined

      const ogGraphicURL = theme.graphicURL

      let graphicURL = fd.get('image') as string | undefined
      if (!graphicURL || graphicURL === '') graphicURL = undefined

      let providersJSON = fd.get('providers') as string | undefined
      if (!providersJSON || providersJSON === '') providersJSON = undefined

      const providers = providersJSON ? JSON.parse(providersJSON) : undefined

      theme = {
        ...theme,
        heading: heading,
        signMessageTemplate: signMessageTemplate,
        radius: radius,
        color:
          color && colorDark
            ? {
                light: color,
                dark: colorDark,
              }
            : undefined,
        graphicURL: graphicURL,
        providers: providers,
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
        await coreClient.starbase.setAppTheme.mutate({
          clientId,
          theme,
        })

        deleteUpdatedImage(context, ogGraphicURL, graphicURL)
      }

      return json({
        errors,
      })
    }

    const updateEmail = async (fd: FormData, theme: EmailOTPTheme) => {
      const ogLogoURL = theme.logoURL
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
        await coreClient.starbase.setEmailOTPTheme.mutate({
          clientId,
          theme,
        })

        deleteUpdatedImage(context, ogLogoURL, logoURL)
      }

      return json({
        errors,
      })
    }

    const updateOg = async (fd: FormData, theme: OGTheme) => {
      let title = fd.get('ogTitle') as string | undefined
      if (!title || title === '') title = undefined

      let description = fd.get('ogDescription') as string | undefined
      if (!description || description === '') description = undefined

      const ogImageURL = theme.image
      let image = fd.get('ogImage') as string | undefined
      if (!image || image === '') image = undefined

      theme = {
        ...theme,
        title: title ?? theme?.title,
        description: description ?? theme?.description,
        image: image ?? theme?.image,
      }

      const zodErrors = await OGThemeSchema.spa(theme)
      if (!zodErrors.success) {
        const mappedIssues = zodErrors.error.issues.map((issue) => ({
          path: `ogTheme.${issue.path.join('.')}`,
          message: issue.message,
        }))

        errors = mappedIssues.reduce((acc, curr) => {
          acc[curr.path] = curr.message
          return acc
        }, {} as { [key: string]: string })
      } else {
        await coreClient.starbase.setOgTheme.mutate({
          clientId,
          theme,
        })

        deleteUpdatedImage(context, ogImageURL, image)
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
      case 'og':
        return updateOg(fd, ogTheme)
      default:
        throw new BadRequestError({
          message: 'Invalid target',
        })
    }
  }
)

export default () => {
  const { appTheme, emailTheme, ogTheme, passportURL } = useLoaderData<{
    appTheme: GetAppThemeResult
    emailTheme: GetEmailOTPThemeResult
    ogTheme: GetOgThemeResult
    passportURL: string
  }>()

  const {
    appDetails,
    appContactAddress,
    appContactEmail,
    identityURN,
    avatarUrl,
    notificationHandler,
    authorizationURL,
  } = useOutletContext<{
    appDetails: appDetailsProps
    appContactAddress?: AccountURN
    appContactEmail?: string
    identityURN: IdentityURN
    avatarUrl: string
    notificationHandler: notificationHandlerType
    authorizationURL: string
  }>()

  const actionData = useActionData()
  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
    }
  }, [errors])

  const [loading, setLoading] = useState<boolean>(false)
  const [previewState, setPreviewState] = useState<boolean>(false)

  if (appDetails.appPlan === ServicePlanType.FREE && !previewState) {
    return (
      <EarlyAccessPanel
        clientID={appDetails.clientId as string}
        title="Designer"
        subtitle="Customize your Login Experience"
        copy="With a white label feature in your authentication tool, you can customize the user interface to match your brand, giving a seamless experience to your users. This not only enhances brand consistency but also establishes trust with users, making it an essential security measure for protecting sensitive data."
        imgSrc={designerSVG}
        imgClassName="w-[363px]"
        url={'https://docs.rollup.id/platform/console/designer'}
        earlyAccess={false}
        currentPlan={appDetails.appPlan}
        featurePlan={ServicePlanType.PRO}
        identityURN={identityURN}
        showPreviewButton={true}
        handlePreviewButtonClick={() => {
          setPreviewState(true)
        }}
      />
    )
  }

  return (
    <Suspense fallback={<Loader />}>
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
            <Tab className="outline-none">
              {({ selected }) => (
                <DesignerTab
                  Icon={HiOutlineCog}
                  text="Login"
                  selected={selected}
                />
              )}
            </Tab>

            <Tab className="outline-none">
              {({ selected }) => (
                <DesignerTab
                  Icon={HiOutlineShare}
                  text="Open Graph"
                  selected={selected}
                />
              )}
            </Tab>

            <Tab className="outline-none">
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
              appName={appDetails.app.name}
              appTheme={appTheme}
              avatarURL={avatarUrl}
              appIconURL={appDetails.app.icon}
              authorizationURL={authorizationURL}
              appPublished={appDetails.published ?? false}
              setLoading={setLoading}
              errors={errors}
            />

            <OGPanel
              setLoading={setLoading}
              errors={errors}
              ogTheme={ogTheme}
              hostname={appDetails.customDomain?.hostname}
            />

            <EmailPanel
              clientId={appDetails.clientId!}
              accountURN={appContactAddress}
              appContactEmail={appContactEmail}
              appPublished={appDetails.published ?? false}
              emailTheme={emailTheme}
              setLoading={setLoading}
              errors={errors}
              passportURL={passportURL}
            />
          </Tab.Panels>
        </Tab.Group>
      </Form>
    </Suspense>
  )
}

const deleteUpdatedImage = async (
  context: AppLoadContext,
  previousURL: string | undefined,
  newURL: string | undefined
) => {
  if (previousURL && previousURL !== newURL) {
    const imageClient = createImageClient(context.env.Images, {
      headers: generateTraceContextHeaders(context.traceSpan),
    })

    await imageClient.delete.mutate(previousURL)
  }
}
