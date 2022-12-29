import { createDurable } from 'itty-durable'

import type { Environment, IttyDurableObjectState } from '../types'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: true,
}) {
  state: IttyDurableObjectState
  profile: object | undefined

  constructor(state: IttyDurableObjectState, env: Environment) {
    super(state, env)
    this.state = state
  }

  async getProfile(): Promise<object> {
    // TODO: remove this migration code after 2023-01-30
    if (!this.profile || Object.keys(this.profile).length === 0) {
      const oldProfile = await this.state.storage.get('profile')
      this.profile = oldProfile
    }
    return this.profile || {}
  }

  setProfile(profile: object): void {
    this.profile = profile
    return
  }
}
