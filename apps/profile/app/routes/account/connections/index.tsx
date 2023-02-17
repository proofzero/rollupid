import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { useFetcher, useLoaderData, useOutletContext } from '@remix-run/react'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'
import type { AddressURN } from '@kubelt/urns/address'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import InputText from '~/components/inputs/InputText'
import { NodeType } from '@kubelt/types/address'
import { AccountURN } from '@kubelt/urns/account'
import warn from '~/assets/warning.svg'

const normalizeProfile = (profile: any) => {
  switch (profile.__typename) {
    case 'CryptoAddressProfile':
      return {
        id: profile.urn,
        address: profile.address,
        title: profile.displayName,
        icon: profile.avatar,
        chain: 'Ethereum',
      }
    case 'OAuthGoogleProfile':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Google',
      }
    case 'OAuthTwitterProfile':
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.profile_image_url_https,
        chain: 'Twitter',
      }
    case 'OAuthGithubProfile':
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.avatar_url,
        chain: 'GitHub',
      }
    case 'OAuthMicrosoftProfile':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Microsoft',
      }
    case 'OAuthAppleProfile':
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.picture,
        chain: 'Apple',
      }
    case 'OAuthDiscordProfile':
      return {
        id: profile.urn,
        address: profile.email,
        title: `${profile.username}#${profile.discriminator}`,
        icon: `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`,
        chain: 'Discord',
      }
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressTypeUrns = addresses.map((a) => ({
    urn: a.baseUrn,
    nodeType: a.rc.node_type,
  }))

  // This returns profiles without urns
  const profiles =
    (await getAddressProfiles(
      jwt,
      addressTypeUrns.map((atu) => atu.urn as AddressURN)
    )) ?? []

  // This mapps to a new structure that contains urn also;
  // useful for list keys as well as for address context actions as param
  const mappedProfiles = profiles.map((p, i) => ({
    ...addressTypeUrns[i],
    ...p,
  }))

  // Keeping the distinctions to only append
  // context actions to desired types
  // e.x. rename to crypto profiles
  const cryptoProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.Crypto)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile)

  const vaultProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.Vault)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile)

  const oAuthProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.OAuth)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile)

  return {
    cryptoProfiles,
    vaultProfiles,
    oAuthProfiles,
  }
}

const AccountSettingsConnections = () => {
  const { cryptoProfiles, vaultProfiles, oAuthProfiles } = useLoaderData()

  const { accountURN } = useOutletContext<{
    accountURN: AccountURN
  }>()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)

  const [actionId, setActionId] = useState<null | string>()
  const [actionProfile, setActionProfile] = useState<any>()

  const fetcher = useFetcher()

  useEffect(() => {
    const selectedProfile = cryptoProfiles
      .concat(vaultProfiles)
      .concat(oAuthProfiles)
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
      fetcher.load('/account/connections')
    }
  }, [fetcher])

  const requestConnectAccount = () => {
    // Server side remix doesn't have window
    // so we need to make this comparison
    if (!(typeof window !== 'undefined')) {
      return
    }

    const windowUrl = new URL(
      `${(window as any).ENV.PASSPORT_URL}/authenticate`
    )

    const clientId = (window as any).ENV.PROFILE_CLIENT_ID

    // prompt lets passport authentication know this is a connect call
    // not a new account one, and thus generate the proper cookie
    windowUrl.searchParams.append('prompt', 'login')
    windowUrl.searchParams.append('client_id', clientId)
    windowUrl.searchParams.append('redirect_uri', window.location.href)

    window.location.href = windowUrl.toString()
  }

  return (
    <section>
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        Accounts
      </Text>
      <div className="flex flex-row-reverse mt-7">
        <Button
          onClick={() => {
            requestConnectAccount()
          }}
        >
          Connect Account
        </Button>
      </div>

      <div className="mt-1">
        <Text size="sm" weight="normal" className="text-gray-500 mb-4">
          CONNECTED ACCOUNTS
        </Text>

        <Modal
          isOpen={renameModalOpen}
          handleClose={() => setRenameModalOpen(false)}
        >
          <div
            className={`min-w-[437px] relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
          >
            <Text size="lg" weight="semibold" className="text-gray-900 mb-8">
              Name Your Account
            </Text>

            <fetcher.Form method="post" action="/account/connections/rename">
              {actionId && <input type="hidden" name="id" value={actionId} />}

              <InputText
                required
                heading=""
                name="name"
                disabled={actionProfile?.title.endsWith('.eth')}
                defaultValue={actionProfile?.title ?? ''}
              />
              {actionProfile?.address && (
                <Text size="xs" weight="normal" className="text-gray-500 mt-2">
                  address: {actionProfile?.address}
                </Text>
              )}
              <div className="flex justify-end items-center space-x-3 mt-20">
                <Button
                  btnType="secondary-alt"
                  onClick={() => setRenameModalOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" btnType="primary">
                  Save
                </Button>
              </div>
            </fetcher.Form>
          </div>
        </Modal>

        <Modal
          isOpen={disconnectModalOpen}
          handleClose={() => setDisconnectModalOpen(false)}
        >
          <div
            className={`w-[62vw] transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto flex items-start space-x-4`}
          >
            <img src={warn} />

            <div className="flex-1">
              <Text size="lg" weight="medium" className="text-gray-900 mb-2">
                Disconnect account
              </Text>

              <Text size="sm" weight="normal" className="text-gray-500">
                Are you sure you want to disconnect "
                <span className="text-gray-800">{actionProfile?.title}</span>"
                from Rollup? You might lose access to some functionality.
              </Text>

              <fetcher.Form
                method="post"
                action="/account/connections/disconnect"
              >
                {actionId && <input type="hidden" name="id" value={actionId} />}

                <div className="flex justify-end items-center space-x-3 mt-20">
                  <Button
                    btnType="secondary-alt"
                    onClick={() => setDisconnectModalOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" btnType="dangerous">
                    Disconnect
                  </Button>
                </div>
              </fetcher.Form>
            </div>
          </div>
        </Modal>

        <AddressList
          addresses={cryptoProfiles
            .map((ap: AddressListItemProps) => ({
              ...ap,
              onRenameAccount: ap.title.endsWith('.eth')
                ? null
                : (id: string) => {
                    setActionId(id)
                    setRenameModalOpen(true)
                  },
              onDisconnect:
                ap.id === accountURN
                  ? null
                  : (id: string) => {
                      setActionId(id)
                      setDisconnectModalOpen(true)
                    },
            }))
            .concat(oAuthProfiles)}
        />

        <Text size="sm" weight="normal" className="text-gray-500 my-7">
          DEDICATED VAULT ACCOUNTS
        </Text>

        <AddressList
          addresses={vaultProfiles.map((ap: AddressListItemProps) => ({
            ...ap,
            onRenameAccount: (id: string) => {
              setActionId(id)
              setRenameModalOpen(true)
            },
          }))}
        />
      </div>
    </section>
  )
}

export default AccountSettingsConnections
