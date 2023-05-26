import { useEffect, useState } from 'react'

import { RiLoader5Fill } from 'react-icons/ri'
import { TbInfoCircle } from 'react-icons/tb'

import { json } from '@remix-run/cloudflare'
import { useFetcher, useActionData, useLoaderData } from '@remix-run/react'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import type { FetcherWithComponents } from '@remix-run/react'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Copier } from '@proofzero/design-system/src/atoms/copier/Copier'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'

import wwwIcon from '@proofzero/design-system/src/assets/www.svg'
import trashIcon from '@proofzero/design-system/src/assets/trash.svg'
import reloadIcon from '@proofzero/design-system/src/assets/reload.svg'

import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { CustomDomain } from '@proofzero/platform.starbase/src/types'

import { DocumentationBadge } from '~/components/DocumentationBadge'
import { requireJWT } from '~/utilities/session.server'

import dangerVector from '~/images/danger.svg'

type AppData = { customDomain?: CustomDomain; hostname: string }

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
    return json({ customDomain, hostname })
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

    const { hostname } = new URL(PASSPORT_URL)

    if (request.method === 'PUT') {
      const formData = await request.formData()

      const hostname = formData.get('hostname')
      if (typeof hostname !== 'string')
        throw new BadRequestError({ message: 'Invalid Hostname' })
      if (!hostname) throw new BadRequestError({ message: 'Missing Hostname' })

      const customDomain = await starbaseClient.createCustomDomain.mutate({
        clientId,
        hostname,
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
  const { customDomain, hostname } = fetcher.data || actionData || loaderData
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutId) return
    if (customDomain?.ssl.status !== 'initializing') return
    const submit = async () => fetcher.submit(null, { method: 'post' })
    setTimeoutId(setTimeout(submit, 2000))
  }, [fetcher, timeoutId, customDomain?.ssl.status])

  return (
    <section className="flex flex-col space-y-5">
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
  const isValidated =
    customDomain.status === 'active' && customDomain.ssl.status === 'active'
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
            <TXTRecord
              title="Certificate validation"
              statusColor={
                customDomain.ssl.status === 'active'
                  ? 'bg-green-600'
                  : 'bg-orange-500'
              }
              name={
                customDomain.ssl.validation_records?.[0].txt_name ||
                'Setting up...'
              }
              value={
                customDomain.ssl.validation_records?.[0].txt_value ||
                'Setting up...'
              }
            />
            <TXTRecord
              title="Hostname pre-validation"
              statusColor={
                customDomain.status === 'active'
                  ? 'bg-green-600'
                  : 'bg-orange-500'
              }
              name={
                customDomain.ownership_verification?.name || 'Setting up...'
              }
              value={
                customDomain.ownership_verification?.value || 'Setting up...'
              }
            />
          </div>
          <Text size="sm" weight="medium" className="text-gray-700">
            Step 2: CNAME Record
          </Text>
          {isValidated && <CNAMEForm hostname={hostname} />}
          {!isValidated && (
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
    </>
  )
}

type CNAMEProps = {
  hostname: string
}

const CNAMEForm = ({ hostname }: CNAMEProps) => {
  return (
    <div className="p-5 border rounded-lg">
      <div className="w-80 space-y-1">
        <Text size="sm" weight="medium" className="text-gray-700">
          CNAME Record
        </Text>
        <div className="flex flex-row justify-between items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-no-drop">
          <Text type="span" size="sm" className="text-gray-500">
            {hostname}
          </Text>
          <Copier
            value={hostname}
            color="text-gray-500"
            onCopy={() =>
              toast(
                ToastType.Success,
                { message: 'CNAME value copied to clipboard!' },
                { duration: 2000 }
              )
            }
          />
        </div>
      </div>
    </div>
  )
}

type TXTRecordProps = {
  title: string
  statusColor: string
  name: string
  value: string
}

const TXTRecord = ({ title, statusColor, name, value }: TXTRecordProps) => (
  <>
    <div className="flex flex-row space-x-8">
      <div className="flex space-x-4">
        <span
          className={`w-2 h-2 relative top-[38px] rounded-full ${statusColor}`}
        ></span>
        <div className="w-80 space-y-1">
          <Text size="sm" weight="medium" className="text-gray-700">
            {title} TXT Name
          </Text>
          <div className="flex-1 flex flex-row justify-between items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-no-drop">
            <Text
              type="span"
              size="sm"
              className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {name}
            </Text>
            <Copier
              value={name}
              color="text-gray-500"
              onCopy={() =>
                toast(
                  ToastType.Success,
                  { message: `${title} TXT name copied to clipboard!` },
                  { duration: 2000 }
                )
              }
            />
          </div>
        </div>
      </div>
      <div className="w-96 space-y-1">
        <Text size="sm" weight="medium" className="text-gray-700">
          {title} TXT Value
        </Text>
        <div className="flex flex-row justify-between items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-no-drop">
          <Text
            type="span"
            size="sm"
            className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {value}
          </Text>
          <Copier
            value={value}
            color="text-gray-500"
            onCopy={() =>
              toast(
                ToastType.Success,
                { message: `${title} TXT value copied to clipboard!` },
                { duration: 2000 }
              )
            }
          />
        </div>
      </div>
    </div>
  </>
)

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
        className={`flex w-[512px] items-start space-x-4 px-4 pt-5 pb-4 text-left overflow-y-auto rounded-lg bg-white
         shadow-xl transform transition-all`}
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