import { z } from 'zod'
import { Context } from '../../context'
import { initObjectNodeByName } from '../../nodes'

import { Visibility } from '../../types'

import { getBaseKey, getObjectKey } from '../../utils'
import { InternalServerError } from '@proofzero/errors'

export const PutObjectInput = z.object({
  namespace: z.string(),
  path: z.string(),
  value: z.any(),
  options: z
    .object({
      visibility: z.enum([Visibility.PRIVATE, Visibility.PUBLIC]),
    })
    .optional(),
})

export const PutObjectOutput = z.object({
  size: z.number(),
  version: z.number(),
})

export type PutObjectParams = z.infer<typeof PutObjectInput>

export const putObjectMethod = async ({
  input,
  ctx,
}: {
  input: PutObjectParams
  ctx: Context
}) => {
  const { namespace, path, value, options } = input
  const { visibility } = options || {}

  const baseKey = getBaseKey(namespace, path)
  const node = await initObjectNodeByName(baseKey, ctx.env.Meta)
  const index = await node.class.get()

  index.version += 1
  if (visibility) {
    index.visibility = visibility
  }

  try {
    const Bucket: R2Bucket = ctx.env.Bucket
    const metadata = await Bucket.put(
      getObjectKey(node.id.toString(), baseKey, index.version),
      JSON.stringify(value)
    )
    await node.class.set(index.version, index.visibility)
    if (!metadata) {
      throw new InternalServerError({
        message: 'Metadata is null',
      })
    }
    return {
      size: metadata.size,
      version: index.version,
    }
  } catch (err) {
    console.error(err)
    throw (err as Error).message
  }
}
