import { isAddress } from '@ethersproject/address'

export const check = (address: string, type: string) => {
  if (type == 'eth') {
    if (!isAddress(address)) {
      throw 'bad eth address'
    }
  } else if (type == 'ens') {
    if (!address.endsWith('.eth')) {
      throw 'bad ens name'
    }
  } else {
    throw 'unsupported address type'
  }
}
