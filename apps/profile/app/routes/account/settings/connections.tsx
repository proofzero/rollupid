import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { useLoaderData } from '@remix-run/react'
import { CryptoAddressType, NodeType } from '@kubelt/types/address'
import { LoaderFunction } from 'react-router-dom'
import { getAccountAddresses, getAddressProfile } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'
import { AddressURN } from '@kubelt/urns/address'
import { AddressListItemProps } from '~/components/addresses/AddressListItem'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = await getAccountAddresses(jwt)
  const cryptoAddresses =
    addresses?.filter((e) => {
      if (!e.rc) return

      return e?.rc?.node_type === NodeType.Crypto
    }) || []

  const addressProfiles: AddressListItemProps[] = await Promise.all(
    cryptoAddresses.map(async (cryptoAddress) => {
      const profile = await getAddressProfile(
        jwt,
        cryptoAddress.urn as AddressURN
      )

      const rparams = new URLSearchParams(cryptoAddress.rc || '')
      const qparams = new URLSearchParams(cryptoAddress.qc || '')

      const addrType = rparams.get('addr_type')
      const alias = qparams.get('alias')

      let chain = undefined
      switch (addrType) {
        case CryptoAddressType.ETH:
          chain = 'Ethereum'
      }

      return {
        id: cryptoAddress.urn,
        type: addrType as string,
        address: alias as string,
        chain: chain as string,
        title: alias as string,
        icon: profile?.pfp?.image as string,
      }
    })
  )

  return { addressProfiles }
}

const AccountSettingsConnections = () => {
  const { addressProfiles } = useLoaderData<{
    addressProfiles: AddressListItemProps[]
  }>()

  return (
    <section>
      <div className="flex flex-row-reverse mt-7">
        <Button>Connect Account</Button>
      </div>

      <div className="mt-1">
        <Text size="sm" weight="normal" className="text-gray-500 mb-7">
          CONNECTED ACCOUNTS
        </Text>

        <AddressList addresses={addressProfiles} />
      </div>
    </section>
  )
}

export default AccountSettingsConnections
