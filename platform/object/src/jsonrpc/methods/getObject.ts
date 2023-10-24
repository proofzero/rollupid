import { z } from 'zod'
import { Context } from '../../context'
import { initObjectNodeByName } from '../../nodes'

import { getBaseKey, getObjectKey } from '../../utils'

export const GetObjectInput = z.object({
  namespace: z.string(),
  path: z.string(),
})

export const GetObjectOutput = z.object({
  value: z.unknown(),
  version: z.number(),
})

export type GetObjectParams = z.infer<typeof GetObjectInput>

export const getObjectMethod = async ({
  input,
  ctx,
}: {
  input: GetObjectParams
  ctx: Context
}) => {
  const { namespace, path } = input

  const baseKey = getBaseKey(namespace, path)
  const node = await initObjectNodeByName(baseKey, ctx.env.Meta)

  const { version } = await node.class.get()

  if (version == 0) {
    const value = null
    return { value, version }
  }

  const objectKey = getObjectKey(node.id.toString(), baseKey, version)
  const Bucket: R2Bucket = ctx.env.Bucket
  const stored = await Bucket.get(objectKey)

  if (!stored) {
    await node.storage.deleteAll()
    return { value: null, version: 0 }
  }

  if ((stored as R2ObjectBody).body) {
    const value = await (stored as R2ObjectBody).json()
    return { value, version }
  }

  throw 'Invalid object'
}
