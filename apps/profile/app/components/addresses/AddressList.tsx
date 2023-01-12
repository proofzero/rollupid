import { SortableList } from '@kubelt/design-system/src/atoms/lists/SortableList'
import { AddressListItem, AddressListItemProps } from './AddressListItem'

type AddressListProps = {
  addresses: AddressListItemProps[]
}

export const AddressList = ({ addresses }: AddressListProps) => {
  return (
    <SortableList
      items={addresses.map((ali) => (
        <AddressListItem key={ali.id} {...ali} />
      ))}
    />
  )
}
