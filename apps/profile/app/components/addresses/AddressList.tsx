import { List } from '@kubelt/design-system/src/atoms/lists/List'
import type { AddressListItemProps } from './AddressListItem'
import { AddressListItem } from './AddressListItem'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

type AddressListProps = {
  addresses: AddressListItemProps[]
}

export const AddressList = ({ addresses }: AddressListProps) => {
  return addresses.length ? (
    <List
      items={addresses.map((ali) => ({ key: ali.id, val: ali }))}
      itemRenderer={(item) => <AddressListItem key={item.key} {...item.val} />}
    />
  ) : (
    <div className="w-full flex flex-col items-center justify-center">
      <Text className="mb-[27px] text-gray-500">
        No Vaults Account Detected ☹️
      </Text>
    </div>
  )
}
