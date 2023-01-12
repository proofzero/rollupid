import { AddressListItem, AddressListItemProps } from './AddressListItem'

type AddressListProps = {
  addresses: AddressListItemProps[]
}

export const AddressList = ({ addresses }: AddressListProps) => {
  return (
    <div>
      <section className="flex flex-col space-y-2">
        {addresses.map((ali) => (
          <AddressListItem key={ali.id} {...ali} />
        ))}
      </section>
    </div>
  )
}
