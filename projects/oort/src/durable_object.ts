import { Router } from 'itty-router'

export default class DurableObject {
  id: string
  state: DurableObjectState
  env: Environment
  storage: DurableObjectStorage
  router: Router

  constructor(state: DurableObjectState, env: Environment) {
    this.id = state.id.toString()
    this.env = env
    this.state = state
    this.storage = state.storage
    this.router = Router()
    this.registerRoutes()
  }

  registerRoutes() {
    throw new Error('not implemented')
  }

  async fetch(request: Request): Promise<Response> {
    return this.router.handle(request)
  }
}
