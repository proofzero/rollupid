import apple from '../atoms/providers/Apple'
import discord from '../assets/social_icons/discord.svg'
import email from '../assets/social_icons/email.svg'
import ethereum from '../assets/social_icons/ethereum.svg'
import facebook from '../assets/social_icons/facebook.svg'
import github from '../atoms/providers/Github'
import google from '../atoms/providers/Google'
import microsoft from '../atoms/providers/Microsoft'
import twitter from '../assets/social_icons/twitter.svg'
import wallets from '../assets/social_icons/wallets.png'
import webauthn from '../atoms/providers/Webauthn'

export default (provider: string) => {
  switch (provider) {
    case 'apple':
      return apple
    case 'discord':
      return discord
    case 'email':
      return email
    case 'webauthn':
      return webauthn
    case 'ethereum':
      return ethereum
    case 'facebook':
      return facebook
    case 'github':
      return github
    case 'google':
      return google
    case 'microsoft':
      return microsoft
    case 'twitter':
      return twitter
    case 'wallet':
      return wallets
    default:
      return undefined
  }
}
