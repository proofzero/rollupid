import {
  useOutletContext,
  useLoaderData,
  useFetcher,
  useNavigate,
} from '@remix-run/react'

import { useState, useEffect } from 'react'

import { Text } from '@proofzero/design-system'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'

import { AddressList } from '~/components/addresses/AddressList'
import InputText from '~/components/inputs/InputText'

import { normalizeProfileToConnection } from '~/utils/profile'

import { NodeType } from '@proofzero/types/address'

import type { FetcherWithComponents } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import type { AddressListProps } from '~/components/addresses/AddressList'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'

import warn from '~/assets/warning.svg'

export const loader: LoaderFunction = async ({ request }) => {
  const reqUrl = new URL(request.url)
  const reqUrlError = reqUrl.searchParams.get('error')

  return {
    reqUrlError,
  }
}

const distinctProfiles = (connectedProfiles: any[]) => {
  // Keeping the distinctions to only append
  // context actions to desired types
  // e.x. rename to crypto profiles
  const cryptoProfiles = {
    addresses: connectedProfiles
      .filter((p) => p?.nodeType === NodeType.Crypto)
      .map((p) => ({
        urn: p.urn,
        type: p.type,
        nodeType: p.nodeType,
        ...p?.profile,
      }))
      .map(normalizeProfileToConnection),
  } as AddressListProps

  const vaultProfiles = {
    addresses: connectedProfiles
      .filter((p) => p?.nodeType === NodeType.Vault)
      .map((p) => ({
        urn: p.urn,
        type: p.type,
        nodeType: p.nodeType,
        ...p?.profile,
      }))
      .map(normalizeProfileToConnection),
  } as AddressListProps

  const oAuthProfiles = {
    addresses: connectedProfiles
      .filter((p) => p?.nodeType === NodeType.OAuth)
      .map((p) => ({
        urn: p.urn,
        type: p.type,
        nodeType: p.nodeType,
        ...p?.profile,
      }))
      .map(normalizeProfileToConnection),
  } as AddressListProps

  const emailProfiles = {
    addresses: connectedProfiles
      .filter((p) => p?.nodeType === NodeType.Email)
      .map((p) => ({
        urn: p.urn,
        type: p.type,
        nodeType: p.nodeType,
        ...p?.profile,
      }))
      .map(normalizeProfileToConnection),
  } as AddressListProps

  return {
    addressCount: connectedProfiles.length,
    cryptoProfiles,
    vaultProfiles,
    oAuthProfiles,
    emailProfiles,
  }
}

const RenameModal = ({
  fetcher,
  isOpen,
  setIsOpen,
  id,
  data,
}: {
  fetcher: FetcherWithComponents<any>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  id: string
  data: {
    title: string
    address: string
  }
}) => (
  <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
    <div
      className={`min-w-[300px] sm:min-w-[437px] relative transform rounded-lg
      bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
    >
      <Text size="lg" weight="semibold" className="text-gray-900 mb-4">
        Name Your Account
      </Text>

      <fetcher.Form method="post" action="/settings/accounts/rename">
        <input type="hidden" name="id" value={id} />

        <InputText
          required
          heading=""
          name="name"
          disabled={data.title && data.title.endsWith('.eth')}
          defaultValue={data.title ?? ''}
        />
        <Text size="xs" weight="normal" className="text-gray-500 mt-2">
          address: {data.address}
        </Text>
        <div className="flex justify-end items-center space-x-3 mt-6">
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button type="submit" btnType="primary">
            Save
          </Button>
        </div>
      </fetcher.Form>
    </div>
  </Modal>
)

const DisconnectModal = ({
  fetcher,
  isOpen,
  setIsOpen,
  id,
  data,
}: {
  fetcher: FetcherWithComponents<any>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  id: string
  data: {
    title: string
    type: string
  }
}) => (
  <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
    <div
      className={`min-w-[437px] relative transform rounded-lg  bg-white px-4 pt-5 pb-4
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
    >
      <div className=" flex items-start space-x-4">
        <img src={warn} alt="Not Found" />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="text-gray-900 my-1">
            Disconnect account
          </Text>

          <Text size="sm" weight="normal" className="text-gray-500 my-7">
            Are you sure you want to disconnect {data.type} account
            {data.title && (
              <>
                "<span className="text-gray-800">{data.title}</span>"
              </>
            )}
            from Rollup? You might lose access to some functionality.
          </Text>

          <fetcher.Form method="post" action="/settings/accounts/disconnect">
            <input type="hidden" name="id" value={id} />

            <div className="flex justify-end items-center space-x-3 mt-7">
              <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" btnType="dangerous">
                Disconnect
              </Button>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </div>
  </Modal>
)

export default function AccountsLayout() {
  const { reqUrlError } = useLoaderData()

  const { connectedProfiles } = useOutletContext<{
    connectedProfiles: any[]
  }>()

  const {
    cryptoProfiles,
    vaultProfiles,
    oAuthProfiles,
    emailProfiles,
    addressCount,
  } = distinctProfiles(connectedProfiles)

  const navigate = useNavigate()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)

  const [actionId, setActionId] = useState<null | string>()
  const [actionProfile, setActionProfile] = useState<any>()

  const [loading, setLoading] = useState(false)

  const fetcher = useFetcher()

  useEffect(() => {
    if (!sessionStorage.getItem('connection_requested')) {
      return
    }

    if (reqUrlError) {
      sessionStorage.removeItem('connection_requested')

      let error = 'Error'
      switch (reqUrlError) {
        case 'ALREADY_CONNECTED':
          error = 'Account already connected'
      }

      toast(ToastType.Error, { message: error }, { duration: 2000 })
    } else {
      sessionStorage.removeItem('connection_requested')
      toast(
        ToastType.Success,
        { message: 'Account connected' },
        { duration: 2000 }
      )
    }
  }, [reqUrlError])

  useEffect(() => {
    const selectedProfile = cryptoProfiles.addresses
      .concat(vaultProfiles.addresses)
      .concat(oAuthProfiles.addresses)
      .concat(emailProfiles.addresses)
      .find((p: any) => p.id === actionId)

    setActionProfile(selectedProfile)
  }, [actionId])

  useEffect(() => {
    if (fetcher.state === 'submitting' && fetcher.type === 'actionSubmission') {
      setRenameModalOpen(false)
      setDisconnectModalOpen(false)

      setActionId(undefined)
    }
    if (fetcher.type === 'actionReload') {
      fetcher.load('/settings/accounts')
    }

    if (fetcher.state !== 'idle') {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [fetcher])

  const requestConnectAccount = () => {
    // Server side remix doesn't have window
    // so we need to make this comparison
    if (!(typeof window !== 'undefined')) {
      return
    }

    const qp = new URLSearchParams()
    qp.append('prompt', 'login')
    qp.append('client_id', 'passport')

    // Removing search so that subsequent errors
    // won't be appended to queryString
    const currentWindowUrl = new URL(window.location.href)
    currentWindowUrl.search = ''

    qp.append('redirect_uri', currentWindowUrl.toString())

    sessionStorage.setItem('connection_requested', 'true')

    navigate(`/authorize?${qp.toString()}`)
  }

  return (
    <section>
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        Accounts
      </Text>
      {loading && <Loader />}
      <div className="flex flex-row-reverse mt-7">
        <Button
          onClick={() => {
            requestConnectAccount()
          }}
          btnType="primary-alt"
        >
          Connect Account
        </Button>
      </div>

      <div className="mt-1">
        <Text size="sm" weight="normal" className="text-gray-500 mb-4">
          CONNECTED ACCOUNTS
        </Text>

        {actionId && actionProfile && (
          <>
            <RenameModal
              fetcher={fetcher}
              isOpen={renameModalOpen}
              setIsOpen={setRenameModalOpen}
              id={actionId}
              data={actionProfile}
            />

            <DisconnectModal
              fetcher={fetcher}
              isOpen={disconnectModalOpen}
              setIsOpen={setDisconnectModalOpen}
              id={actionId}
              data={actionProfile}
            />
          </>
        )}

        <AddressList
          addresses={cryptoProfiles.addresses
            .map((ap: AddressListItemProps) => ({
              ...ap,
              onRenameAccount: ap.title.endsWith('.eth')
                ? undefined
                : (id: string) => {
                    setActionId(id)
                    setRenameModalOpen(true)
                  },
            }))
            .concat(
              oAuthProfiles.addresses.map((ap) => ({
                ...ap,
                onRenameAccount: undefined,
              }))
            )
            .concat(
              emailProfiles.addresses.map((ap: AddressListItemProps) => ({
                ...ap,
                onRenameAccount: (id: string) => {
                  setActionId(id)
                  setRenameModalOpen(true)
                },
              }))
            )
            .map((ap: AddressListItemProps) => ({
              ...ap,
              onDisconnect:
                addressCount === 1
                  ? undefined
                  : (id: string) => {
                      setActionId(id)
                      setDisconnectModalOpen(true)
                    },
            }))}
        />

        <Text size="sm" weight="normal" className="text-gray-500 my-7">
          DEDICATED VAULT ACCOUNTS
        </Text>

        <AddressList
          addresses={vaultProfiles.addresses.map(
            (ap: AddressListItemProps) => ({
              ...ap,
              onRenameAccount: (id: string) => {
                setActionId(id)
                setRenameModalOpen(true)
              },
            })
          )}
        />
      </div>
    </section>
  )
}
