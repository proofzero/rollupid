import { useOutletContext, useFetcher, useNavigate } from '@remix-run/react'

import { useState, useEffect } from 'react'

import { Text } from '@proofzero/design-system'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import { AccountList } from '~/components/accounts/AccountList'
import InputText from '~/components/inputs/InputText'

import { CryptoAccountType, NodeType } from '@proofzero/types/account'

import { getValidatedSessionContext } from '~/session.server'
import { setNewPrimaryAccount } from '~/utils/authenticate.server'
import { InternalServerError } from '@proofzero/errors'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import AccountDisconnectModal from '~/components/settings/accounts/DisconnectModal'

import type { FetcherWithComponents } from '@remix-run/react'
import type { ActionFunction } from '@remix-run/cloudflare'
import type { AccountListProps } from '~/components/accounts/AccountList'
import type { AccountListItemProps } from '~/components/accounts/AccountListItem'
import type { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { HiOutlineX } from 'react-icons/hi'
import dangerVector from '~/assets/warning.svg'

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
      const primaryAccount = JSON.parse(
        formData.get('primaryAccount') as string
      )

      if (primaryAccount) {
        await setNewPrimaryAccount(
          jwt,
          context.env,
          context.traceSpan,
          primaryAccount.id,
          primaryAccount.icon,
          primaryAccount.title
        )
      }

      return null
    } catch (e) {
      throw new InternalServerError({
        message: 'Failed to set new primary account',
      })
    }
  }
)

const distinctProfiles = (connectedProfiles: any[]) => {
  // Keeping the distinctions to only append
  // context actions to desired types
  // e.x. rename to crypto profiles
  const cryptoProfiles = {
    accounts: connectedProfiles.filter(
      (p) =>
        p.nodeType === NodeType.Crypto && p.type !== CryptoAccountType.Wallet
    ),
  } as AccountListProps

  const smartContractWallets = {
    accounts: connectedProfiles.filter(
      (p) =>
        p.nodeType === NodeType.Crypto && p.type === CryptoAccountType.Wallet
    ),
  } as AccountListProps

  const oAuthProfiles = {
    accounts: connectedProfiles.filter((p) => p.nodeType === NodeType.OAuth),
  } as AccountListProps

  const emailProfiles = {
    accounts: connectedProfiles.filter((p) => p.nodeType === NodeType.Email),
  } as AccountListProps
  const webauthnProfiles = {
    accounts: connectedProfiles.filter((p) => p.nodeType === NodeType.WebAuthN),
  } as AccountListProps

  return {
    accountCount: connectedProfiles.length,
    cryptoProfiles,
    smartContractWallets,
    oAuthProfiles,
    emailProfiles,
    webauthnProfiles,
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
      className={`min-w-[300px] sm:min-w-[437px] relative
      bg-white p-4 text-left rounded-lg transition-all sm:p-6 overflow-y-auto`}
    >
      <div className="mb-4 flex flex-row items-center justify-between w-full">
        <Text size="lg" weight="semibold" className="text-gray-900">
          Name Your Account
        </Text>
        <button
          className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
          onClick={() => {
            setIsOpen(false)
          }}
        >
          <HiOutlineX />
        </button>
      </div>

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

          <Button type="submit" btnType="primary-alt">
            Save
          </Button>
        </div>
      </fetcher.Form>
    </div>
  </Modal>
)

const SetPrimaryAccountModal = ({
  isOpen,
  setIsOpen,
  fetcher,
  accountData,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  fetcher: FetcherWithComponents<any>
  accountData?: AccountListItemProps
}) => (
  <Modal isOpen={isOpen} handleClose={setIsOpen}>
    <div
      className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex flex-row items-start space-x-4`}
    >
      <img src={dangerVector} alt="danger" />

      <section className="flex flex-col space-y-4">
        <div className="flex flex-row items-center justify-between w-full">
          <Text size="lg" weight="medium" className="text-gray-900">
            Set Account as Primary Account
          </Text>
          <button
            type="button"
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => setIsOpen(false)}
            tabIndex={-1}
          >
            <HiOutlineX />
          </button>
        </div>

        <section>
          <Text size="sm" weight="normal" className="text-gray-500 my-3">
            Are you sure you want to set the account as Primary Account? <br />
            This action will override your current profile picture and username
            using ones from this Account.
          </Text>
        </section>

        <fetcher.Form method="post" action="/settings/accounts">
          <input
            type="hidden"
            name="primaryAccount"
            value={JSON.stringify(accountData)}
          />

          <div className="flex justify-end items-center space-x-3 mt-7">
            <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" btnType="dangerous-alt">
              Confirm & Set
            </Button>
          </div>
        </fetcher.Form>
      </section>
    </div>
  </Modal>
)

export default function AccountsLayout() {
  const { connectedProfiles, primaryAccountURN } = useOutletContext<{
    connectedProfiles: any[]
    primaryAccountURN: AccountURN
  }>()

  const {
    cryptoProfiles,
    smartContractWallets,
    oAuthProfiles,
    emailProfiles,
    accountCount,
    webauthnProfiles,
  } = distinctProfiles(connectedProfiles)

  const connectedAccounts = cryptoProfiles.accounts
    .concat(smartContractWallets.accounts)
    .concat(oAuthProfiles.accounts)
    .concat(emailProfiles.accounts)
    .concat(webauthnProfiles.accounts)

  const navigate = useNavigate()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
  const [setPrimaryModalOpen, setSetPrimaryAccountModalOpen] = useState(false)

  const [actionId, setActionId] = useState<null | string>()
  const [actionProfile, setActionProfile] = useState<any>()

  const [loading, setLoading] = useState(false)

  const fetcher = useFetcher()

  useConnectResult()

  useEffect(() => {
    const selectedProfile = connectedAccounts.find(
      (p: any) => p.id === actionId
    )

    setActionProfile(selectedProfile)
  }, [actionId])

  useEffect(() => {
    if (fetcher.state === 'submitting' && fetcher.type === 'actionSubmission') {
      setRenameModalOpen(false)
      setDisconnectModalOpen(false)
      setSetPrimaryAccountModalOpen(false)

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
              primaryAccountURN={primaryAccountURN}
            />

            <SetPrimaryAccountModal
              fetcher={fetcher}
              isOpen={setPrimaryModalOpen}
              setIsOpen={setSetPrimaryAccountModalOpen}
              accountData={connectedAccounts.find((p) => p.id === actionId)}
            />
          </>
        )}

        <AccountList
          primaryAccountURN={primaryAccountURN}
          onSetPrimary={(id: string) => {
            setActionId(id)
            setSetPrimaryAccountModalOpen(true)
          }}
          accounts={cryptoProfiles.accounts
            .map((ap: AccountListItemProps) => ({
              ...ap,
              onRenameAccount: ap.title.endsWith('.eth')
                ? undefined
                : (id: string) => {
                    setActionId(id)
                    setRenameModalOpen(true)
                  },
            }))
            .concat(
              oAuthProfiles.accounts.map((ap) => ({
                ...ap,
                onRenameAccount: undefined,
              }))
            )
            .concat(
              webauthnProfiles.accounts.map((ap) => ({
                ...ap,
                onRenameAccount: undefined,
              }))
            )
            .concat(
              emailProfiles.accounts.map((ap: AccountListItemProps) => ({
                ...ap,
                onRenameAccount: (id: string) => {
                  setActionId(id)
                  setRenameModalOpen(true)
                },
              }))
            )
            .map((ap: AccountListItemProps) => ({
              ...ap,
              onDisconnect:
                accountCount === 1
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

        <AccountList
          primaryAccountURN={primaryAccountURN}
          accounts={smartContractWallets.accounts.map(
            (ap: AccountListItemProps) => ({
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
