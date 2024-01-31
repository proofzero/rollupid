import Identity from './identity'
import IdentityGroup from './identity-group'

export const initIdentityNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Identity.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const initIdentityGroupNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = IdentityGroup.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export { Identity, IdentityGroup }

export type IdentityNode = ReturnType<typeof initIdentityNodeByName>
export type IdentityGroupNode = ReturnType<typeof initIdentityGroupNodeByName>
