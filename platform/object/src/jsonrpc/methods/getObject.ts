import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import type { GetObjectParams, IndexRecord } from '../../types'

import { getBaseKey, getObjectKey } from '../../utils'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [namespace, path] = request.params as GetObjectParams

  const baseKey = getBaseKey(namespace, path)
  const Index: DurableObjectNamespace = context.get('Index')
  const indexClient = await openrpc.discover(Index, { name: baseKey })
  const { version }: IndexRecord = await indexClient.get()

  if (version == 0) {
    const value = null
    return openrpc.response(request, { value, version })
  }

  const objectKey = getObjectKey(indexClient.$.id, baseKey, version)
  const Bucket: R2Bucket = await context.get('Bucket')
  const stored = await Bucket.get(objectKey)

  if (!stored) {
    await indexClient.delete()
    return openrpc.response(request, { value: null, version: 0 })
  }

  if ((stored as R2ObjectBody).body) {
    const value = await (stored as R2ObjectBody).json()
    return openrpc.response(request, { value, version })
  }
}
