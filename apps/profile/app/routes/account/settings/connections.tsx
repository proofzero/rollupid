import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'
import { AddressURN } from '@kubelt/urns/address'
import { AddressListItemProps } from '~/components/addresses/AddressListItem'
import { LoaderFunction } from '@remix-run/cloudflare'
import { CryptoAddressProfile } from '@kubelt/galaxy-client'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import InputText from '~/components/inputs/InputText'
import { NodeType } from '@kubelt/types/address'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []

  // This is a hack mapping for node type
  // we should get rid of it once edges
  // gets refactored
  const addressTypeUrns = addresses.map((a) => ({
    urn: a.urn,
    nodeType: new URLSearchParams(Object.keys(a.rc)[0]).get('node_type'),
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
    .map((p) => ({ urn: p.urn, ...(p?.profile as CryptoAddressProfile) }))
    .map((p) => ({
      id: p.urn,
      address: p.address,
      title: p.displayName,
      icon: p.avatar,
      chain: 'Ethereum',
    }))

  const vaultProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.Vault)
    .map((p) => ({ urn: p.urn, ...(p?.profile as CryptoAddressProfile) }))
    .map((p) => ({
      id: p.urn,
      address: p.address,
      title: p.displayName,
      icon: p.avatar,
      chain: 'Ethereum',
    }))

  const oAuthProfiles = mappedProfiles
    .filter((p) => p?.nodeType === NodeType.OAuth)
    .map((p) => {
      // To do: add more mappings
      // this will also be refactored
      // in the future
      switch (p?.profile?.__typename) {
        case 'OAuthGithubProfile':
          return {
            id: p.urn,
            address: p.urn,
            title: p.profile.name,
            icon: p.profile.avatar_url,
            chain: 'GitHub',
          }
      }
    })

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

  useEffect(() => {
    const selectedProfile = cryptoProfiles
      .concat(vaultProfiles)
      .concat(oAuthProfiles)
      .find((p: any) => p.id === actionId)

    setActionProfile(selectedProfile)
  }, [actionId])

  const submit = useSubmit()

  return (
    <section>
      <div className="flex flex-row-reverse mt-7">
        <Button>Connect Account</Button>
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

            <Form
              method="post"
              action="/account/settings/connections/rename"
              onSubmit={(e) => {
                const targetForm = e.currentTarget
                submit(targetForm)

                setRenameModalOpen(false)
                setActionId(undefined)
              }}
            >
              {actionId && <input type="hidden" name="id" value={actionId} />}

              <InputText
                required
                heading=""
                name="name"
                defaultValue={actionProfile?.title ?? ''}
              />
              {actionProfile?.address && (
                <Text size="xs" weight="normal" className="text-gray-500 mt-2">
                  {actionProfile?.address}
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
            </Form>
          </div>
        </Modal>

        <AddressList
          addresses={cryptoProfiles
            .map((ap: AddressListItemProps) => ({
              ...ap,
              onRenameAccount: (id: string) => {
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
