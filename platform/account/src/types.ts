import type { Router } from 'itty-router'

export interface Environment {
  Account: DurableObjectNamespace
}

export interface IttyDurableObjectState extends DurableObjectState {
  defaultState: undefined
  initialized: boolean
  router: Router
  env: Environment
}
