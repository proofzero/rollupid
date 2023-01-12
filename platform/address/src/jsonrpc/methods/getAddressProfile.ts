import { z } from 'zod'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import { AddressURNSpace } from '@kubelt/urns/address'

import { Context } from '../../context'
import { CryptoAddressProfile, CryptoAddressType } from '../../types'
import { AddressProfileSchema } from '../validators/profile'

export const GetAddressProfileOutput = AddressProfileSchema

type GetAddressProfileResult = z.infer<typeof GetAddressProfileOutput>

export const getAddressProfileMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<GetAddressProfileResult> => {
  const nodeClient = ctx.address
  const profile = await nodeClient?.class.getProfile()
  if (profile) {
    return profile
  }
  const address = await nodeClient?.class.getAddress()
  const type = await nodeClient?.class.getType()

  if (!address || !type) {
    throw new Error('missing address or type')
  }

  switch (type) {
    case CryptoAddressType.ETH: {
      if (!ctx.alias) throw new Error('missing alias')
      const [ethProfile] = await Promise.all([
        getCryptoAddressProfile(ctx.alias),
      ])

      // don't set profile (only set when explicitly set by user)
      // await nodeClient?.class.setProfile<CryptoAddressProfile>(ethProfile)
      return ethProfile as CryptoAddressProfile
    }
    default:
      // if we don't have a profile at this point then something is wrong
      // profiles are set on OAuth nodes when setData is called
      throw new Error('Unsupported address type')
  }
}

const getCryptoAddressProfile = async (
  address: string
): Promise<CryptoAddressProfile> => {
  const ensClient = new ENSUtils()
  console.log('getCryptoAddressProfile: address', address)
  const { avatar, displayName } = await ensClient.getEnsEntry(address)

  const newProfile: CryptoAddressProfile = {
    address: address,
    displayName: displayName || address,
    avatar: avatar || '',
  }

  return newProfile
}
