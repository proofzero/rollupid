import { DOProxy } from 'do-proxy'
import type { Profile, Links, Gallery, Addresses } from '../types'

export default class Account extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getProfile(): Promise<Profile | null> {
    const stored = await this.state.storage.get<Profile>('profile')
    return stored || null
  }

  async setProfile(profile: Profile): Promise<void> {
    return this.state.storage.put('profile', profile)
  }

  async getLinks(): Promise<Links | null> {
    const stored = await this.state.storage.get<Links>('links')
    return stored || null
  }

  async setLinks(links: Links): Promise<void> {
    return this.state.storage.put('links', links)
  }

  async getGallery(): Promise<Gallery | null> {
    const stored = await this.state.storage.get<Gallery>('gallery')
    return stored || null
  }

  async setGallery(gallery: Gallery): Promise<void> {
    return this.state.storage.put('gallery', gallery)
  }

  async getAddresses(): Promise<Addresses | null> {
    const stored = await this.state.storage.get<Addresses>('addresses')
    return stored || null
  }
}
