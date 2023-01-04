import Access from './access'
import Authorization from './authorization'

export const initAuthorizationNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Authorization.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const initAccessNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Access.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export { Access, Authorization }
