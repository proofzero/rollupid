import { SortableList } from '@kubelt/design-system/src/atoms/lists/SortableList'
import { AddressListItem, AddressListItemProps } from './AddressListItem'

type AddressListProps = {
  addresses: AddressListItemProps[]
}

export const AddressList = ({ addresses }: AddressListProps) => {
  return (
    <SortableList
      items={addresses.map((ali) => ({ key: ali.id, val: ali }))}
      itemRenderer={(item) => <AddressListItem key={item.key} {...item.val} />}
    />
  )
}
