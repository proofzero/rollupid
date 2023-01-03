import { proxyDurable } from 'itty-durable'
import Account from './account'

export const initAccountNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const proxy = await proxyDurable(durableObject, {
    name: 'account',
    class: Account,
    parse: true,
  })

  const node = proxy.get(name) as Account
  return node
}
