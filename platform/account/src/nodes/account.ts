import { createDurable } from 'itty-durable'
import { Environment } from '..'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: true,
}) {
  // state: DurableObjectState
  profile: object | undefined

  constructor(state: DurableObjectState, env: Environment) {
    super(state, env)
  }

  async getProfile(): Promise<object> {
    // TODO: remove this migration code after 2023-01-30

    if (!this.profile) {
      // @ts-ignore
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
