import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AddressList } from '~/components/addresses/AddressList'
import { useOutletContext } from '@remix-run/react'
import { AddressListItemProps } from '~/components/Addresses/AddressListItem'
import { Node } from '@kubelt/galaxy-client'

const AccountSettingsConnections = () => {
  const { addresses } = useOutletContext<{
    addresses: Node[]
  }>()

  const mappedAddresses: AddressListItemProps[] = addresses.map((node) => {
    const rparams = new URLSearchParams(node.rc || '')
    const qparams = new URLSearchParams(node.qc || '')
    const addrType = rparams.get('addr_type')
    const alias = qparams.get('alias')
    return {
      id: node.urn,
      type: addrType,
      address: alias as string,
      chain: 'Foo',
      network: 'Bar',
      title: 'Biz',
      wallet: 'Baz',
      icon: 'https://picsum.photos/256',
    }
  })

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
