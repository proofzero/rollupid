import Address from './address'

export const initAddressNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Address.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export type AddressNode = ReturnType<typeof initAddressNodeByName>
