import { z } from 'zod'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import { AddressURNSpace } from '@kubelt/urns/address'

import { Context } from '../../context'
import {
  AddressProfile,
  CryptoAddressProfile,
  NFTarVoucher,
} from '../../types'
import { AddressProfileSchema } from '../validators/profile'
import { CryptoAddressProxyStub } from '../../nodes/crypto'
import { CryptoAddressType } from '@kubelt/types/address'

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
    case CryptoAddressType.Ethereum:
    case CryptoAddressType.ETH: {
      const decodedAddress = AddressURNSpace.decode(address)
      const [ethProfile, voucher] = await Promise.all([
        getCryptoAddressProfile(decodedAddress),
        getNftarVoucher(decodedAddress, type, ctx),
      ])

      if (!voucher) {
        throw new Error('Unable to get voucher from Nftar')
      }
      const pfp = gatewayFromIpfs(voucher.metadata.image)
      ethProfile.avatar ||= pfp

      await (nodeClient as CryptoAddressProxyStub).class.setVoucher(voucher)

      await nodeClient?.class.setProfile<CryptoAddressProfile>(ethProfile)
      return ethProfile as AddressProfile
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
  const { avatar, displayName } = await ensClient.getEnsEntry(address)

  const newProfile: CryptoAddressProfile = {
    address: address,
    displayName: displayName || address,
    avatar: avatar || '',
  }

  return newProfile
}

type NftarError = {
  data: {
    message: string
  }
}

type NftarResponse = {
  error?: NftarError
  result?: NFTarVoucher
}

const getNftarVoucher = async (
  address: string,
  type: string,
  context: Context
): Promise<NFTarVoucher | undefined> => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${context.TOKEN_NFTAR}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: type,
          chainId: context.NFTAR_CHAIN_ID,
        },
      },
    }),
  }
  const response = await fetch(`${context.NFTAR_URL}`, request)
  const responseBody: NftarResponse = await response.json()

  if ('error' in responseBody) {
    throw new Error(JSON.stringify(responseBody.error))
  } else if ('result' in responseBody) {
    return responseBody.result
  }
}

const gatewayFromIpfs = (ipfsUrl: string): string => {
  const regex =
    /ipfs:\/\/(?<prefix>ipfs\/)?(?<cid>[a-zA-Z0-9]+)(?<path>(?:\/[\w.-]+)+)?/
  const match = ipfsUrl?.match(regex)

  if (!ipfsUrl || !match) return ipfsUrl

  const prefix = match[1]
  const cid = match[2]
  const path = match[3]

  const url = `https://nftstorage.link/${prefix ? `${prefix}` : 'ipfs/'}${cid}${
    path ? `${path}` : ''
  }`

  fetch(url) // prime the gateway
  return url
}
