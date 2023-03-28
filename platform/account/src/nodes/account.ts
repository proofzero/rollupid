import { DOProxy } from 'do-proxy'
import type { Profile, AddressList } from '../types'

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

  async getAddresses(): Promise<AddressList | null> {
    const stored = await this.state.storage.get<AddressList>('addresses')
    return stored || null
  }
}
