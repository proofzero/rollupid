import { string, z } from 'zod'

import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

import { Context } from '../../context'
import {
  AddressProfileSchema,
  AppleProfileSchema,
  CryptoAddressProfileSchema,
  DiscordRawProfileSchema,
  EmailProfileSchema,
  GithubRawProfileSubsetSchema,
  GoogleRawProfileSchema,
  MicrosoftRawProfileSchema,
  TwitterProfileSchema,
} from '../validators/profile'
import CryptoAddress from '../../nodes/crypto'
import GithubAddress from '../../nodes/github'
import GoogleAddress from '../../nodes/google'
import TwitterAddress from '../../nodes/twitter'
import MicrosoftAddress from '../../nodes/microsoft'
import AppleAddress from '../../nodes/apple'
import DiscordAddress from '../../nodes/discord'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import EmailAddress from '../../nodes/email'

export const GetAddressProfileOutput = z.discriminatedUnion('type', [
  z.object({
    urn: AddressURNInput,
    profile: CryptoAddressProfileSchema,
    type: z.literal(CryptoAddressType.ETH),
  }),
  z.object({
    urn: AddressURNInput,
    profile: GithubRawProfileSubsetSchema,
    type: z.literal(OAuthAddressType.GitHub),
  }),
  z.object({
    urn: AddressURNInput,
    profile: TwitterProfileSchema,
    type: z.literal(OAuthAddressType.Twitter),
  }),
  z.object({
    urn: AddressURNInput,
    profile: GoogleRawProfileSchema,
    type: z.literal(OAuthAddressType.Google),
  }),
  z.object({
    urn: AddressURNInput,
    profile: MicrosoftRawProfileSchema,
    type: z.literal(OAuthAddressType.Microsoft),
  }),
  z.object({
    urn: AddressURNInput,
    profile: AppleProfileSchema,
    type: z.literal(OAuthAddressType.Apple),
  }),
  z.object({
    urn: AddressURNInput,
    profile: DiscordRawProfileSchema,
    type: z.literal(OAuthAddressType.Discord),
  }),
  z.object({
    urn: AddressURNInput,
    profile: EmailProfileSchema,
    type: z.literal(EmailAddressType.Email),
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

  if (!ctx.addressURN) throw new Error('missing addressURN')

  //TODO: update the oauth node type to fetch profile from provider

  switch (type) {
    case CryptoAddressType.ETH: {
      const cryptoNode = new CryptoAddress(nodeClient)
      const profile = await cryptoNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: CryptoAddressType.ETH,
        profile,
      }
    }
    case OAuthAddressType.GitHub: {
      const oAuthNode = new GithubAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.GitHub,
        profile,
      }
    }
    case OAuthAddressType.Twitter: {
      const oAuthNode = new TwitterAddress(nodeClient)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.Twitter,
        profile,
      }
    }
    case OAuthAddressType.Google: {
      const oAuthNode = new GoogleAddress(nodeClient, ctx)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.Google,
        profile,
      }
    }
    case OAuthAddressType.Microsoft: {
      const oAuthNode = new MicrosoftAddress(nodeClient, ctx)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.Microsoft,
        profile,
      }
    }
    case OAuthAddressType.Apple: {
      const oAuthNode = new AppleAddress(nodeClient, ctx)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.Apple,
        profile,
      }
    }
    case OAuthAddressType.Discord: {
      const oAuthNode = new DiscordAddress(nodeClient, ctx)
      const profile = await oAuthNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: OAuthAddressType.Discord,
        profile,
      }
    }
    case EmailAddressType.Email: {
      const emailNode = new EmailAddress(nodeClient)
      const profile = await emailNode.getProfile()
      return {
        urn: ctx.addressURN,
        type: EmailAddressType.Email,
        profile,
      }
    }
    default:
      // if we don't have a profile at this point then something is wrong
      // profiles are set on OAuth nodes when setData is called
      throw new Error('Unsupported address type')
  }
}
