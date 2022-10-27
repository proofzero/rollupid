import { error } from 'itty-router-extras'
import { getCoreId } from '../utils'
import { withCors } from './cors'

/**
 * A generic worker environment interface declaring `Core` binding.
 *
 * Worker packages should extend this interface for additional bindings.
 */
export interface CoreWorkerEnvironment {
  Core: DurableObjectNamespace
}

/**
 * A generic core (durable object) request router implementation.
 *
 * `getCoreId` utility function is called to get the durable object instance
 * associated with the request.
 */
export const coreRequestHandler = async <
  Environment extends CoreWorkerEnvironment
>(
  request: Request,
  env: Environment
): Promise<Response> => {
  const coreId = await getCoreId(request, env)
  if (!coreId) {
    const response = error(400, 'missing core identifier')
    withCors(request, response)
    return response
  }
  const core = env.Core.get(coreId)
  const init = await core.fetch(request)
  const response = new Response(init.body, init)
  withCors(request, response)
  return response
}
