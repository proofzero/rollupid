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

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressUrns = addresses.map((ca) => ca.urn as AddressURN)
  const profiles = (await getAddressProfiles(jwt, addressUrns)) ?? []

  const cryptoProfiles = profiles
    .filter((p) => p?.profile.__typename === 'CryptoAddressProfile')
    .map((p) => p?.profile as CryptoAddressProfile)
    .map((p, i) => ({
      id: addresses[i].id,
      address: p.address,
      title: p.displayName,
      icon: p.avatar,
      chain: 'Ethereum',
    })) as AddressListItemProps[]

  return {
    addressProfiles: cryptoProfiles,
  }
}

const AccountSettingsConnections = () => {
  const { addressProfiles } = useLoaderData()

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
          addresses={addressProfiles.map((ap: AddressListItemProps) => ({
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
