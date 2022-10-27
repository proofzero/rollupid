import { isAddress } from '@ethersproject/address'

export const getType = (address: string): string | null => {
  if (isAddress(address)) {
    return 'eth'
  }
  if (address.endsWith('.eth')) {
    return 'ens'
  }

  return null
}
