import { createDurable } from 'itty-durable'
import { Environment } from '..'

export default class Account extends createDurable({ autoReturn: true }) {
  // state: DurableObjectState
  profile: object

  constructor(state: DurableObjectState, env: Environment) {
    super(state, env)
    this.profile ||= {}
  }

  getProfile(): object {
    return this.profile
  }

  setProfile(profile: object): void {
    this.profile = profile
  }
}
