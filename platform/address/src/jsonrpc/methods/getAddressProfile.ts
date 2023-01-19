import { z } from 'zod'

import { Context } from '../../context'
import { CryptoAddressType } from '../../types'
import {
  AddressProfileSchema,
  CryptoAddressProfileSchema,
  GithubRawProfileSubsetSchema,
  GoogleRawProfileSchema,
  MicrosoftRawProfileSchema,
  TwitterProfileSchema,
} from '../validators/profile'
import { OAuthAddressType } from '@kubelt/types/address'
import OAuthAddress from '../../nodes/oauth'
import CryptoAddress from '../../nodes/crypto'
import GithubAddress from '../../nodes/github'
import GoogleAddress from '../../nodes/google'
import TwitterAddress from '../../nodes/twitter'
import MicrosoftAddress from '../../nodes/microsoft'

export const GetAddressProfileOutput = z.discriminatedUnion('type', [
  z.object({
    profile: CryptoAddressProfileSchema,
    type: z.literal(CryptoAddressType.ETH),
  }),
  z.object({
    profile: GithubRawProfileSubsetSchema,
    type: z.literal(OAuthAddressType.GitHub),
  }),
  z.object({
    profile: TwitterProfileSchema,
    type: z.literal(OAuthAddressType.Twitter),
  }),
  z.object({
    profile: GoogleRawProfileSchema,
    type: z.literal(OAuthAddressType.Google),
  }),
  z.object({
    profile: MicrosoftRawProfileSchema,
    type: z.literal(OAuthAddressType.Microsoft),
  }),
])

type GetAddressProfileResult = z.infer<typeof GetAddressProfileOutput>

export const getAddressProfileMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<GetAddressProfileResult> => {
  const nodeClient = ctx.address
  if (!nodeClient) throw new Error('missing nodeClient')

  const address = await nodeClient?.class.getAddress()
  const type = await nodeClient?.class.getType()

  if (!address || !type) {
    throw new Error('missing address or type')
  }

  //TODO: update the oauth node type to fetch profile from provider

  switch (type) {
    case CryptoAddressType.ETH: {
      const cryptoNode = new CryptoAddress(nodeClient)
      const profile = await cryptoNode.getProfile()
      console.log({ profile })
      return {
        type: CryptoAddressType.ETH,
        profile,
      }
    }
    case OAuthAddressType.GitHub: {
      const oAuthNode = new GithubAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        type: OAuthAddressType.GitHub,
        profile,
      }
    }
    case OAuthAddressType.Twitter: {
      const oAuthNode = new TwitterAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        type: OAuthAddressType.Twitter,
        profile,
      }
    }
    case OAuthAddressType.Google: {
      const oAuthNode = new GoogleAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        type: OAuthAddressType.Google,
        profile,
      }
    }
    case OAuthAddressType.Microsoft: {
      const oAuthNode = new MicrosoftAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        type: OAuthAddressType.Microsoft,
        profile,
      }
    }
    // case OAuthAddressType.GitHub:
    // case OAuthAddressType.Twitter:
    // case OAuthAddressType.Google:
    // case OAuthAddressType.Microsoft: {
    //   const oAuthNode = new OAuthAddress(nodeClient)
    //   return oAuthNode.getProfile()
    // }
    default:
      // if we don't have a profile at this point then something is wrong
      // profiles are set on OAuth nodes when setData is called
      throw new Error('Unsupported address type')
  }
}
