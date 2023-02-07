import { AddressURN } from '@kubelt/urns/address'

export type AccountProfile = {
  cover: string
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
}
