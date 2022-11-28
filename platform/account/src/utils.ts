import { URNSpace } from 'urns'

export const accountURNSpace = new URNSpace('threeid', {
  decode: (nss) => {
    const [service, name] = nss.split('/')
    if (service != 'account') {
      throw `Invalid 3RN service name. Got ${service}, expected "account".`
    }
    return name
  },
})
