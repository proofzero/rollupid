import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'
import type { AddressURN } from '@kubelt/urns/address'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import InputText from '~/components/inputs/InputText'
import { NodeType } from '@kubelt/types/address'

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
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressTypeUrns = addresses.map((a) => ({
    urn: a.urn,
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

  const [renameModalOpen, setRenameModalOpen] = useState(false)
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
      setActionId(undefined)
    }
    if (fetcher.type === 'actionReload') {
      fetcher.load('/account/settings/connections')
    }
  }, [fetcher])

  return (
    <section>
      <div className="flex flex-row-reverse mt-7">
        <Button disabled>Connect Account</Button>
      </div>

      <div className="mt-1">
        <Text size="sm" weight="normal" className="text-gray-500 mb-7">
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

            <fetcher.Form
              method="post"
              action="/account/settings/connections/rename"
            >
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
