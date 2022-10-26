import Core from '../core'

import Ping from './ping'
import Auth from './auth'
import Management from './management'
import Objects from './objects'
import Storage from './storage'
import { Metrics, Events } from './analytics'
import EthereumNameService from './ens'
import ThreeId from './threeid'

export type Packages = {
  ping: Ping
  auth: Auth
  management: Management
  objects: Objects
  storage: Storage
  metrics: Metrics
  events: Events
  ens: EthereumNameService
  threeid: ThreeId
}

export default (core: Core): Packages => ({
  ping: new Ping(core),
  auth: new Auth(core),
  management: new Management(core),
  objects: new Objects(core),
  storage: new Storage(core),
  metrics: new Metrics(core),
  events: new Events(core),
  ens: new EthereumNameService(core),
  threeid: new ThreeId(core),
})
