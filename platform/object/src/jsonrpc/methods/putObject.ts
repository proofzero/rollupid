import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import {
  IndexRecord,
  PutObjectOptions,
  PutObjectParams,
  Visibility,
} from '../../types'

import { getBaseKey, getObjectKey } from '../../utils'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [namespace, path, value, options] = request.params as PutObjectParams
  const { visibility } = options as PutObjectOptions

  if (visibility) {
    switch (visibility) {
      case Visibility.PRIVATE:
      case Visibility.PUBLIC:
        return openrpc.error(request, {
          code: -32500,
          message: `invalid visibility: ${visibility}`,
        })
      default:
        break
    }
  }

  const baseKey = getBaseKey(namespace, path)
  const Index: DurableObjectNamespace = context.get('Index')
  const indexClient = await openrpc.discover(Index, { name: baseKey })
  const index: IndexRecord = await indexClient.get()

  index.version += 1
  if (visibility) {
    index.visibility = visibility
  }

  try {
    const Bucket: R2Bucket = context.get('Bucket')
    const metadata = await Bucket.put(
      getObjectKey(indexClient.$.id, baseKey, index.version),
      JSON.stringify(value)
    )
    await indexClient.set(index)
    return {
      size: metadata.size,
      version: index.version,
    }
  } catch (err) {
    console.error(err)
    return openrpc.error(request, {
      code: -32500,
      message: (err as Error).message,
    })
  }
}
