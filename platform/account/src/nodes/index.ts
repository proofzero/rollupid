import Account from './account'

export const initAccountNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Account.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const deleteAccountNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Account.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return await node.storage.deleteAll()
}
