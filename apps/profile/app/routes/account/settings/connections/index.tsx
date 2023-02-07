import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { useFetcher, useOutletContext } from '@remix-run/react'
import { AddressListItemProps } from '~/components/addresses/AddressListItem'
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
        address: profile.name,
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
        address: profile.name,
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

  throw new Error('Unknown address type')
}

const AccountSettingsConnections = () => {
  const { addressProfiles } = useOutletContext<{ addressProfiles: any[] }>()

  const cryptoProfiles = addressProfiles
    .filter((p) => p?.nodeType === NodeType.Crypto)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile) as any[]

  const vaultProfiles = addressProfiles
    .filter((p) => p?.nodeType === NodeType.Vault)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile) as any[]

  const oAuthProfiles = addressProfiles
    .filter((p) => p?.nodeType === NodeType.OAuth)
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfile) as any[]

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
                ? () => {}
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
