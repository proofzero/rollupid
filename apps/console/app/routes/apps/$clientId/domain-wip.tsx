import { useEffect, useState } from 'react'

import { HiOutlineCog } from 'react-icons/hi'
import { RiLoader5Fill } from 'react-icons/ri'
import { TbInfoCircle } from 'react-icons/tb'

import { json } from '@remix-run/cloudflare'
import {
  useFetcher,
  useActionData,
  useLoaderData,
  Link,
} from '@remix-run/react'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import type { FetcherWithComponents } from '@remix-run/react'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Copier } from '@proofzero/design-system/src/atoms/copier/Copier'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'

import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'
import discordIcon from '@proofzero/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@proofzero/design-system/src/atoms/providers/Github'
import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
import twitterIcon from '@proofzero/design-system/src/assets/social_icons/twitter.svg'

import wwwIcon from '@proofzero/design-system/src/assets/www.svg'
import trashIcon from '@proofzero/design-system/src/assets/trash.svg'
import reloadIcon from '@proofzero/design-system/src/assets/reload.svg'

import { BadRequestError } from '@proofzero/errors'
import { OAuthAddressType } from '@proofzero/types/address'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { CustomDomain } from '@proofzero/platform.starbase/src/types'

import { DocumentationBadge } from '~/components/DocumentationBadge'
import { requireJWT } from '~/utilities/session.server'

import dangerVector from '~/images/danger.svg'

type AppData = {
  clientId: string
  customDomain?: CustomDomain
  hostname: string
  cname: string
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const jwt = await requireJWT(request)
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const customDomain = await starbaseClient.getCustomDomain.query({
      clientId,
    })

    const { hostname } = new URL(PASSPORT_URL)

    return json({ clientId, customDomain, hostname })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const jwt = await requireJWT(request)
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const passportUrl = new URL(PASSPORT_URL)
    const { hostname } = passportUrl

    if (request.method === 'PUT') {
      const formData = await request.formData()

      const hostname = formData.get('hostname')
      if (typeof hostname !== 'string')
        throw new BadRequestError({ message: 'Invalid Hostname' })
      if (!hostname) throw new BadRequestError({ message: 'Missing Hostname' })
      const customDomain = await starbaseClient.createCustomDomain.mutate({
        clientId,
        hostname,
        passportHostname: passportUrl.hostname,
      })

      return json({ customDomain, hostname })
    } else if (request.method === 'POST') {
      const customDomain = await starbaseClient.getCustomDomain.query({
        clientId,
        refresh: true,
      })
      return json({ customDomain, hostname })
    } else if (request.method === 'DELETE') {
      await starbaseClient.deleteCustomDomain.mutate({ clientId })
      return json({ customDomain: null, hostname })
    }
  }
)

export default () => {
  const fetcher = useFetcher()
  const actionData = useActionData<AppData>()
  const loaderData = useLoaderData<AppData>()
  const { clientId, customDomain, hostname } =
    fetcher.data || actionData || loaderData
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutId) return
    if (customDomain?.ssl.status !== 'initializing') return
    const submit = async () => fetcher.submit(null, { method: 'post' })
    setTimeoutId(setTimeout(submit, 2000))
  }, [fetcher, timeoutId, customDomain?.ssl.status])

  return (
    <section className="flex flex-col space-y-5">
      {fetcher.state === 'submitting' && <Loader />}
      <div className="flex flex-row">
        <div className="flex flex-row items-center space-x-3">
          <Text size="2xl" weight="semibold" className="text-gray-900">
            Custom Domain
          </Text>
          <DocumentationBadge
            url={'https://docs.rollup.id/platform/console/custom-domain'}
          />
        </div>
      </div>
      {!customDomain && <HostnameForm fetcher={fetcher} />}
      {customDomain && (
        <HostnameStatus
          fetcher={fetcher}
          customDomain={customDomain}
          hostname={hostname}
        />
      )}
      <LoginProviders clientId={clientId} customDomain={customDomain} />
    </section>
  )
}

type HostnameFormProps = {
  fetcher: FetcherWithComponents<AppData>
}

const HostnameForm = ({ fetcher }: HostnameFormProps) => (
  <fetcher.Form method="put">
    <div className="py-4 space-x-3">
      <Text size="lg" weight="semibold" className="text-gray-800">
        Configured Custom Domain
      </Text>
    </div>
    <div className="flex flex-row items-center">
      <ReadOnlyInput
        id="scheme"
        className="w-[74px] cursor-no-drop border-r-0 rounded-r-none"
        value="https://"
        required
      />
      <Input
        id="hostname"
        type="text"
        placeholder="www.example.com"
        className="w-[302px] mr-2 rounded-l-none focus:z-10"
        required
      />
      <Button type="submit" btnType="secondary-alt" className="h-[38px]">
        Add Domain
      </Button>
    </div>
  </fetcher.Form>
)

type HostnameStatusProps = {
  fetcher: FetcherWithComponents<AppData>
  customDomain: CustomDomain
  hostname: string
}

const HostnameStatus = ({
  fetcher,
  customDomain,
  hostname,
}: HostnameStatusProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const isPreValidated =
    customDomain.status === 'active' && customDomain.ssl.status === 'active'
  const isValidated =
    isPreValidated &&
    customDomain.dns_records.every((r) => r.value?.includes(r.expected_value))
  const bgStatusColor = isValidated ? 'bg-green-600' : 'bg-orange-500'
  const textStatusColor = isValidated ? 'text-green-600' : 'text-orange-500'
  const statusText = isValidated ? 'Validated' : 'Not Validated'
  return (
    <>
      <DeleteModal
        fetcher={fetcher}
        customDomain={customDomain}
        onClose={() => setDeleteModalOpen(false)}
        isOpen={deleteModalOpen}
      />
      <div>
        <div className="flex p-4 space-x-4 bg-white border border-b-0 rounded-t-lg">
          <img src={wwwIcon} alt="WWW" />
          <div className="flex flex-col flex-1 space-y-1">
            <Text size="sm" weight="medium" className="text-gray-700">
              {customDomain.hostname}
            </Text>
            <div className="flex flex-row items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${bgStatusColor}`}></span>
              <span className={`text-sm ${textStatusColor}`}>{statusText}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline space-x-3">
            <fetcher.Form method="post">
              <button type="submit">
                <img src={reloadIcon} alt="Retry" />
              </button>
            </fetcher.Form>
            <button type="submit" onClick={() => setDeleteModalOpen(true)}>
              <img src={trashIcon} alt="Delete" />
            </button>
          </div>
        </div>
        <div className="flex flex-col space-y-4 p-6 bg-white border rounded-b-lg shadow-sm">
          <Text size="sm" weight="medium" className="text-gray-700">
            Step 1: Validation
          </Text>
          <div className="flex flex-col p-4 space-y-5 box-border border rounded-lg">
            {customDomain.status === 'active' &&
              customDomain.ssl.status === 'active' && (
                <div className="flex flex-row p-4 space-x-4 bg-gray-50">
                  <TbInfoCircle size={20} className="text-gray-500 shrink-0" />
                  <Text type="span" size="sm" className="text-gray-500">
                    These records are now just a reference and can be safely
                    deleted.
                  </Text>
                </div>
              )}
            <DNSRecord
              title="Certificate validation"
              validated={customDomain.ssl.status === 'active'}
              type="TXT"
              name={
                customDomain.ssl.validation_records?.[0].txt_name ||
                'Setting up...'
              }
              value={
                customDomain.ssl.validation_records?.[0].txt_value ||
                'Setting up...'
              }
              disableCopier={customDomain.ssl.status === 'active'}
            />
            <DNSRecord
              title="Hostname pre-validation"
              validated={customDomain.status === 'active'}
              type="TXT"
              name={
                customDomain.ownership_verification?.name || 'Setting up...'
              }
              value={
                customDomain.ownership_verification?.value || 'Setting up...'
              }
              disableCopier={customDomain.status === 'active'}
            />
          </div>

          <Text size="sm" weight="medium" className="text-gray-700">
            Step 2: CNAME Record
          </Text>
          <div className="flex flex-col p-4 space-y-5 box-border border rounded-lg">
            {isPreValidated &&
              Array.from(customDomain.dns_records || []).map((r) => (
                <DNSRecord
                  name={r.name}
                  title={''}
                  type={r.record_type}
                  validated={r.value?.includes(r.expected_value) ?? false}
                  value={r.expected_value}
                  key={r.expected_value}
                />
              ))}
            {!isPreValidated && (
              <div className="flex flex-row p-4 space-x-4 bg-gray-50">
                <TbInfoCircle size={20} className="text-gray-500 shrink-0" />
                <Text type="span" size="sm" className="text-gray-500">
                  NOTE: This step can be done only after Step 1 has fully
                  succeeded. <br />
                  It may take up to a few hours for DNS changes to take effect.
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

type DNSRecordProps = {
  title: string
  validated: boolean
  name?: string
  value: string
  type: 'TXT' | 'CNAME'
  disableCopier?: boolean
}

const DNSRecord = ({
  title,
  validated,
  name,
  value,
  type,
  disableCopier = false,
}: DNSRecordProps) => {
  const statusColor = validated ? 'bg-green-600' : 'bg-orange-500'
  return (
    <div className="flex flex-row flex-wrap space-x-4">
      <span
        className={`flex-none rounded-full w-2 h-2 relative top-[38px] ${statusColor}`}
      ></span>
      {name && (
        <div className="flex space-x-4">
          <div className="w-80 space-y-1">
            <Text size="sm" weight="medium" className="text-gray-700">
              {title} {type} Name
            </Text>
            <div className="flex-1 flex flex-row justify-between items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-no-drop">
              <Text
                type="span"
                size="sm"
                className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {name}
              </Text>
              {!disableCopier && (
                <div>
                  <Copier
                    value={name}
                    color="text-gray-500"
                    onCopy={() =>
                      toast(
                        ToastType.Success,
                        {
                          message: `${title} ${type} name copied to clipboard!`,
                        },
                        { duration: 2000 }
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex space-x-4">
        <div className="w-80 space-y-1">
          <Text size="sm" weight="medium" className="text-gray-700">
            {title} {type} Value
          </Text>
          <div className="flex flex-row justify-between items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-no-drop">
            <Text
              type="span"
              size="sm"
              className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {value}
            </Text>
            {!disableCopier && (
              <div>
                <Copier
                  value={value}
                  color="text-gray-500"
                  onCopy={() =>
                    toast(
                      ToastType.Success,
                      {
                        message: `${title} ${type} value copied to clipboard!`,
                      },
                      { duration: 2000 }
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type DeleteModalProps = {
  fetcher: FetcherWithComponents<AppData>
  customDomain: CustomDomain
  isOpen: boolean
  onClose: (value: boolean) => void
}

const DeleteModal = ({
  fetcher,
  customDomain,
  isOpen,
  onClose,
}: DeleteModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Modal isOpen={isOpen} closable={!isSubmitting} handleClose={onClose}>
      <div
        className={`flex w-[512px] rounded-lg  items-start space-x-4 px-4 pb-4 text-left overflow-y-auto bg-white
         transition-all`}
      >
        <img src={dangerVector} alt="Danger" />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="mb-2 text-gray-900">
            Disconnect Domain
          </Text>

          <fetcher.Form method="delete" onSubmit={() => setIsSubmitting(true)}>
            <section className="mb-4">
              <Text size="sm" weight="normal" className="text-gray-500 my-3">
                Are you sure you want to disconnect{' '}
                <b>"{customDomain.hostname}"?</b>
                <br />
                This action will permanently delete all your login provider
                configurations, DNS records and TLS certificates.
              </Text>
            </section>

            <div className="flex justify-end items-center space-x-3">
              <Button
                btnType="secondary-alt"
                disabled={isSubmitting}
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                type="submit"
                btnType="dangerous-alt"
                className={
                  isSubmitting
                    ? 'flex justify-between items-center transition'
                    : ''
                }
              >
                {isSubmitting && (
                  <RiLoader5Fill className="animate-spin" size={22} />
                )}
                Disconnect
              </Button>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </Modal>
  )
}

type LoginProvidersProps = {
  clientId: string
  customDomain?: CustomDomain
}

const LoginProviders = ({ clientId, customDomain }: LoginProvidersProps) => (
  <div>
    <div className="flex flex-row justify-between py-4 space-x-3">
      <Text type="span" size="lg" weight="semibold" className="text-gray-800">
        Login Providers
      </Text>
      <Text type="span" size="sm" className="self-center text-gray-500">
        Login providers can be ordered in{' '}
        <Link to={`/apps/${clientId}/designer`} className="text-indigo-500">
          Designer
        </Link>
      </Text>
    </div>
    <div className="space-y-2">
      {[
        OAuthAddressType.GitHub,
        OAuthAddressType.Twitter,
        OAuthAddressType.Google,
        OAuthAddressType.Apple,
        OAuthAddressType.Discord,
      ].map((type) => (
        <LoginProvider
          key={type}
          type={type}
          clientId={clientId}
          customDomain={customDomain}
        />
      ))}
    </div>
  </div>
)

type LoginProviderProps = {
  type: OAuthAddressType
  clientId: string
  customDomain?: CustomDomain
}

const LoginProvider = ({
  type,
  clientId,
  customDomain,
}: LoginProviderProps) => {
  const [configModalOpen, setConfigModalOpen] = useState(false)

  return (
    <>
      <LoginProviderConfigurationModal
        type={type}
        clientId={clientId}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
      <div className="flex justify-between bg-white box-border border rounded-lg border-gray-200">
        <div className="flex flex-row">
          <div className="w-16 h-16 flex justify-center items-center">
            <img
              className="w-8 h-8"
              src={getLoginProviderIconUrl(type)}
              alt="Login Provider"
            />
          </div>
          <div className="flex flex-col justify-evenly py-2">
            <Text size="sm" weight="medium" className="text-gray-700">
              {getLoginProviderTitle(type)}
            </Text>
            <Text size="xs" className="text-orange-500">
              Not Configured
            </Text>
          </div>
        </div>
        <div className="p-4">
          <Button
            type="submit"
            btnSize="sm"
            btnType="secondary-alt"
            disabled={!customDomain}
            className="flex justify-around align-middle w-[124px] h-[38px]"
            onClick={() => setConfigModalOpen(true)}
          >
            <HiOutlineCog className="inline-block text-xl font-normal text-gray-400" />
            <span>Configure</span>
          </Button>
        </div>
      </div>
    </>
  )
}

type LoginProviderConfiguration = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

type LoginProviderConfigurationModalProps = {
  type: OAuthAddressType
  clientId: string
  isOpen: boolean
  onClose: (value: boolean) => void
}

const LoginProviderConfigurationModal = ({
  type,
  clientId,
  isOpen,
  onClose,
}: LoginProviderConfigurationModalProps) => {
  const fetcher = useFetcher()
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Modal isOpen={isOpen} closable={false}>
      <div className="flex flex-col w-[770px] p-6 space-y-4 rounded-lg">
        <Text
          size="lg"
          weight="medium"
          className="mb-2 text-gray-900 text-left"
        >
          Login Provider Configuration
        </Text>

        <div className="flex space-x-4">
          <img
            className="w-8 h-8"
            src={getLoginProviderIconUrl(type)}
            alt="Login Provider"
          />
          <Text weight="medium" className="self-center leading-6 text-gray-700">
            {getLoginProviderTitle(type)}
          </Text>
        </div>

        <fetcher.Form
          action={`/apps/${clientId}/domain/login-providers`}
          method="post"
          onSubmit={() => setIsSubmitting(true)}
        >
          <div className="flex flex-col space-y-4">
            <Input id="redirectURI" label="Redirect URL" type="url" required />

            <div className="flex space-x-4">
              <div className="flex-1">
                <Input id="clientId" label="Client ID" type="text" required />
              </div>
              <div className="flex-1">
                <Input
                  id="clientSecret"
                  label="Client Secret"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                btnType="secondary-alt"
                disabled={isSubmitting}
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={isSubmitting}
                type="submit"
                btnType="primary-alt"
                className={
                  isSubmitting
                    ? 'flex justify-between items-center transition'
                    : ''
                }
              >
                {isSubmitting && (
                  <RiLoader5Fill className="animate-spin" size={22} />
                )}
                Save
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </Modal>
  )
}

export const getLoginProviderTitle = (type: OAuthAddressType) => {
  switch (type) {
    case OAuthAddressType.Apple:
      return 'Apple'
    case OAuthAddressType.Discord:
      return 'Discord'
    case OAuthAddressType.GitHub:
      return 'GitHub'
    case OAuthAddressType.Google:
      return 'Google'
    case OAuthAddressType.Microsoft:
      return 'Microsoft'
    case OAuthAddressType.Twitter:
      return 'Twitter'
  }
}

export const getLoginProviderIconUrl = (type: OAuthAddressType) => {
  switch (type) {
    case OAuthAddressType.Apple:
      return appleIcon
    case OAuthAddressType.Discord:
      return discordIcon
    case OAuthAddressType.GitHub:
      return githubIcon
    case OAuthAddressType.Google:
      return googleIcon
    case OAuthAddressType.Microsoft:
      return microsoftIcon
    case OAuthAddressType.Twitter:
      return twitterIcon
  }
}
