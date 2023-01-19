import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressList } from '~/components/addresses/AddressList'
import { useLoaderData } from '@remix-run/react'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'
import { AddressURN } from '@kubelt/urns/address'
import { AddressListItemProps } from '~/components/addresses/AddressListItem'
import { LoaderFunction } from '@remix-run/cloudflare'
import { CryptoAddressProfile } from '@kubelt/galaxy-client'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressUrns = addresses.map((ca) => ca.urn as AddressURN)
  const profiles = (await getAddressProfiles(jwt, addressUrns)) ?? []

  const addressProfiles: AddressListItemProps[] = profiles
    ?.filter((p) => p?.__typename === 'CryptoAddressProfile')
    .map((p) => ({
      id: (p as CryptoAddressProfile).address,
      address: (p as CryptoAddressProfile).address,
      title: (p as CryptoAddressProfile).displayName as string,
      icon: (p as CryptoAddressProfile).avatar as string,
      chain: 'Ethereum',
    }))

  return { addressProfiles }
}

const AccountSettingsConnections = () => {
  const { addressProfiles } = useLoaderData()

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
