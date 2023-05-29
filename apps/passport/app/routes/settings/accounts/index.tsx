import {
  useOutletContext,
  useFetcher,
  useNavigate,
  useSubmit,
} from '@remix-run/react'

import { useState, useEffect } from 'react'

import { Text } from '@proofzero/design-system'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import { TbCrown } from 'react-icons/tb'

import { AddressList } from '~/components/addresses/AddressList'
import InputText from '~/components/inputs/InputText'

import { CryptoAddressType, NodeType } from '@proofzero/types/address'

import { getValidatedSessionContext } from '~/session.server'
import { setNewPrimaryAddress } from '~/utils/authenticate.server'
import { InternalServerError } from '@proofzero/errors'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import AccountDisconnectModal from '~/components/settings/accounts/DisconnectModal'

import type { FetcherWithComponents } from '@remix-run/react'
import type { ActionFunction } from '@remix-run/cloudflare'
import type { AddressListProps } from '~/components/addresses/AddressList'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'
import type { AddressURN } from '@proofzero/urns/address'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { jwt } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    try {
      const formData = await request.formData()
      const primaryAddress = JSON.parse(
        formData.get('primaryAddress') as string
      )

      if (primaryAddress) {
        await setNewPrimaryAddress(
          jwt,
          context.env,
          context.traceSpan,
          primaryAddress.id,
          primaryAddress.icon,
          primaryAddress.title
        )
      }

      return null
    } catch (e) {
      throw new InternalServerError({
        message: 'Failed to set new primary address',
      })
    }
  }
)

const distinctProfiles = (connectedProfiles: any[]) => {
  // Keeping the distinctions to only append
  // context actions to desired types
  // e.x. rename to crypto profiles
  const cryptoProfiles = {
    addresses: connectedProfiles.filter(
      (p) =>
        p.nodeType === NodeType.Crypto && p.type !== CryptoAddressType.Wallet
    ),
  } as AddressListProps

  const smartContractWallets = {
    addresses: connectedProfiles.filter(
      (p) =>
        p.nodeType === NodeType.Crypto && p.type === CryptoAddressType.Wallet
    ),
  } as AddressListProps

  const oAuthProfiles = {
    addresses: connectedProfiles.filter((p) => p.nodeType === NodeType.OAuth),
  } as AddressListProps

  const emailProfiles = {
    addresses: connectedProfiles.filter((p) => p.nodeType === NodeType.Email),
  } as AddressListProps

  return {
    addressCount: connectedProfiles.length,
    cryptoProfiles,
    smartContractWallets,
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
          disabled={data.title && data.title.endsWith('.eth') ? true : false}
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

export default function AccountsLayout() {
  const submit = useSubmit()

  const { connectedProfiles, primaryAddressURN } = useOutletContext<{
    connectedProfiles: any[]
    primaryAddressURN: AddressURN
  }>()

  const {
    cryptoProfiles,
    smartContractWallets,
    oAuthProfiles,
    emailProfiles,
    addressCount,
  } = distinctProfiles(connectedProfiles)

  const connectedAddresses = cryptoProfiles.addresses
    .concat(smartContractWallets.addresses)
    .concat(oAuthProfiles.addresses)
    .concat(emailProfiles.addresses)

  const navigate = useNavigate()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)

  const [actionId, setActionId] = useState<null | string>()
  const [actionProfile, setActionProfile] = useState<any>()

  const [loading, setLoading] = useState(false)

  const fetcher = useFetcher()

  useConnectResult()

  useEffect(() => {
    const selectedProfile = connectedAddresses.find(
      (p: any) => p.id === actionId
    )

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
    qp.append('rollup_action', 'connect')
    qp.append('client_id', 'passport')
    qp.append('state', 'skip')
    qp.append('scope', '')

    // Removing search so that subsequent errors
    // won't be appended to queryString
    const currentWindowUrl = new URL(window.location.href)
    currentWindowUrl.search = ''

    qp.append('redirect_uri', currentWindowUrl.toString())

    navigate(`/authorize?${qp.toString()}`)
  }

  return (
    <section>
      <div className="my-4 text-gray-900 flex flex-row justify-between">
        <Text size="xl" weight="bold">
          Accounts
        </Text>

        <Button
          onClick={() => {
            requestConnectAccount()
          }}
          btnType="primary-alt"
        >
          Connect Account
        </Button>
      </div>
      <div className="flex flex-col mb-6">
        <div className="flex flex-row justify-start">
          <div className="bg-gray-100 h-[16px] px-2 mx-2 rounded-xl">
            <TbCrown className="text-[#F59E0B]" />
          </div>
          <Text size="sm" weight="normal" className="text-gray-500">
            Primary account drives which name and picture is shared with
            authorised applications
          </Text>
        </div>
      </div>
      {loading && <Loader />}

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

            <AccountDisconnectModal
              fetcher={fetcher}
              isOpen={disconnectModalOpen}
              setIsOpen={setDisconnectModalOpen}
              id={actionId}
              data={actionProfile}
              primaryAddressURN={primaryAddressURN}
            />
          </>
        )}

        <AddressList
          primaryAddressURN={primaryAddressURN}
          onSetPrimary={(id: string) => {
            const form = new FormData()
            form.set(
              'primaryAddress',
              JSON.stringify(connectedAddresses.find((p) => p.id === id))
            )
            submit(form, { method: 'post', action: '/settings/accounts' })
          }}
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
          SMART CONTRACT WALLETS
        </Text>

        <AddressList
          primaryAddressURN={primaryAddressURN}
          addresses={smartContractWallets.addresses.map(
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
