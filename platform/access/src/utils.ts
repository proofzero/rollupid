import { URNSpace } from 'urns'

export const accessURNSpace = new URNSpace('threeid', {
  decode: (nss) => {
    const [service, name] = nss.split('/')
    if (service != 'access') {
      throw `Invalid 3RN service name. Got ${service}, expected "access".`
    }
    return name
  },
})
