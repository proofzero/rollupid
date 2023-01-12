import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { LoaderFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { getUserSession } from '~/utils/session.server'
import { AddressList } from '~/components/addresses/AddressList'
import { useLoaderData } from '@remix-run/react'
import { AddressListItemProps } from '~/components/Addresses/AddressListItem'

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  const jwt = session.get('jwt')
  const defaultProfileURN = session.get('defaultProfileUrn') as AddressURN

  const galaxyClient = await getGalaxyClient()
  const { connectedAddresses } = await galaxyClient.getConnectedAddresses(
    { addressURN: defaultProfileURN },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  const mappedUrns = connectedAddresses?.map((ca) => {
    const urn = ca as AddressURN
    const name = AddressURNSpace.decode(urn)

    const { rcomponent } = AddressURNSpace.parse(urn)

    const rparams = new URLSearchParams(rcomponent || '')
    const addrType = rparams.get('addr_type')

    return {
      urn: ca,
      address: name,
      type: addrType,
    }
  })

  return {
    mappedUrns,
  }
}

const AccountSettingsConnections = () => {
  const { mappedUrns } = useLoaderData()

  const mappedAddresses: AddressListItemProps[] = mappedUrns.map(
    (ca: { urn: AddressURN; address: string; type: string }) => ({
      id: ca.urn,
      address: ca.address,
      chain: 'Foo',
      network: 'Bar',
      title: 'Biz',
      wallet: 'Baz',
      icon: 'https://picsum.photos/256',
    })
  )

  return (
    <section>
      <div className="flex flex-row-reverse mt-7">
        <Button>Connect Account</Button>
      </div>

      <div className="mt-1">
        <Text size="sm" weight="normal" className="text-gray-500 mb-7">
          CONNECTED ACCOUNTS
        </Text>

        <AddressList addresses={mappedAddresses} />
      </div>
    </section>
  )
}

export default AccountSettingsConnections
