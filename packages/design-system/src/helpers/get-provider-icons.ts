import apple from '../assets/social_icons/apple.svg'
import discord from '../assets/social_icons/discord.svg'
import email from '../assets/social_icons/email.svg'
import ethereum from '../assets/social_icons/ethereum.svg'
import facebook from '../assets/social_icons/facebook.svg'
import github from '../assets/social_icons/github.svg'
import google from '../assets/social_icons/google.svg'
import microsoft from '../assets/social_icons/microsoft.svg'
import twitter from '../assets/social_icons/twitter.svg'
import wallets from '../assets/social_icons/wallets.png'

export default (provider: string) => {
  switch (provider) {
    case 'apple':
      return apple
    case 'discord':
      return discord
    case 'email':
      return email
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
      return null
  }
}
