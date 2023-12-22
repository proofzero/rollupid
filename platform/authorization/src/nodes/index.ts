import Authorization from './authorization'
import ExchangeCode from './exchangecode'

export const initAuthorizationNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  try {
    const MY_DO_BINDING = Authorization.wrap(durableObject)
    const node = MY_DO_BINDING.getByName(name)
    return node
  } catch (e) {
    console.log('INSIDERERROR')
    throw e
  }
}

export const initExchangeCodeNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = ExchangeCode.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export { Authorization, ExchangeCode }

export type AuthorizationNode = ReturnType<typeof initAuthorizationNodeByName>
export type ExchangeCodeNode = ReturnType<typeof initExchangeCodeNodeByName>
