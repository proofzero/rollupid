import Meta from './meta'

export const initObjectNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Meta.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}
