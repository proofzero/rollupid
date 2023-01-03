import { proxyDurable } from 'itty-durable'

import Access from './access'
import Authorization from './authorization'

export const initAuthorizationNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const proxy = await proxyDurable(durableObject, {
    name: 'authorization',
    class: Authorization,
    parse: true,
  })

  const node = proxy.get(name) as Authorization
  return node
}

export const initAccessNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const proxy = await proxyDurable(durableObject, {
    name: 'access',
    class: Access,
    parse: true,
  })

  const node = proxy.get(name) as Access
  return node
}

export { Access, Authorization }
