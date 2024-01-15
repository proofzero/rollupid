import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from '../context'

import {
  getObjectMethod,
  GetObjectInput,
  GetObjectOutput,
} from './methods/getObject'
import {
  putObjectMethod,
  PutObjectInput,
  PutObjectOutput,
} from './methods/putObject'

import { LogUsage } from '@proofzero/platform-middleware/log'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

export const appRouter = t.router({
  getProfile: t.procedure
    .use(LogUsage)
    .input(GetObjectInput)
    .output(GetObjectOutput)
    .query(getObjectMethod),
  setProfile: t.procedure
    .use(LogUsage)
    .input(PutObjectInput)
    .output(PutObjectOutput)
    .mutation(putObjectMethod),
})
