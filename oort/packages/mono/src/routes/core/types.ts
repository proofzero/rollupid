import { Context } from '../../types'

export interface CoreRequest extends Request {
  core: DurableObjectStub
  coreContext: Context
}
