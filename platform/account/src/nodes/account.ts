import { createDurable } from 'itty-durable'

import type { Environment, IttyDurableObjectState } from '../types'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  state: IttyDurableObjectState

  constructor(state: IttyDurableObjectState, env: Environment) {
    super(state, env)
    this.state = state
  }

  async getProfile(): Promise<object> {
    return (await this.state.storage.get('profile')) || {}
  }

  async setProfile(profile: object): Promise<void> {
    return await this.state.storage.put('profile', profile)
  }
}
