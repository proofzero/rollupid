import Account from './account'
import IdentityGroup from './identity-group'

export const initAccountNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Account.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const initIdentityGroupNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = IdentityGroup.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export { Account, IdentityGroup }
