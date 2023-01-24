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
import { useState } from 'react'
import InputText from '~/components/inputs/InputText'
import { CryptoAddressType } from '@kubelt/types/address'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressUrns = addresses.map((ca) => ca.urn as AddressURN)

  // This returns profiles without urns
  const profiles = (await getAddressProfiles(jwt, addressUrns)) ?? []

  // This mapps to a new structure that contains urn also;
  // useful for list keys as well as for address context actions as param
  const mappedProfiles = profiles.map((p, i) => ({ urn: addressUrns[i], ...p }))

  // Keeping the distinctions to only append
  // context actions to desired types
  // e.x. rename to crypto profiles
  const cryptoProfiles = mappedProfiles
    .filter((p) => p?.type === CryptoAddressType.ETH)
    .map((p) => ({ urn: p.urn, ...(p?.profile as CryptoAddressProfile) }))
    .map((p) => ({
      id: p.urn,
      address: p.address,
      title: p.displayName,
      icon: p.avatar,
      chain: 'Ethereum',
    }))

  const oAuthProfiles = mappedProfiles
    .filter((p) => p?.type !== CryptoAddressType.ETH)
    .map((p) => {
      // To do: add more mappings
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
    oAuthProfiles,
  }
}

const AccountSettingsConnections = () => {
  const { cryptoProfiles, oAuthProfiles } = useLoaderData()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [actionId, setActionId] = useState<null | string>()

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

        <Modal isOpen={renameModalOpen}>
          <Form
            method="post"
            action="/account/settings/connections/rename"
            onSubmit={(e) => {
              setRenameModalOpen(false)

              const targetForm = e.currentTarget
              submit(targetForm)
            }}
          >
            {actionId && <input type="hidden" name="id" value={actionId} />}

            <InputText heading="name" name="name" />

            <Button type="submit" btnType="primary-alt">
              Rename
            </Button>
          </Form>
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
      </div>
    </section>
  )
}

export default AccountSettingsConnections
