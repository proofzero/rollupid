import type { Router } from 'itty-router'

export interface IttyDurableObjectState<T> extends DurableObjectState {
  defaultState: undefined
  initialized: boolean
  router: Router
  env: T

  // waitUntil(promise: void | Promise<void>): void
  // readonly id: DurableObjectId
  // readonly storage: DurableObjectStorage
  // blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>
}
