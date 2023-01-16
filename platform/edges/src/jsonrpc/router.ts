import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from '../context'

import {
  findNodeMethod,
  FindNodeMethodInput,
  FindNodeMethodOutput,
} from './methods/findNode'
import {
  getEdgesMethod,
  GetEdgesMethodInput,
  GetEdgesMethodOutput,
} from './methods/getEdges'
import {
  makeEdgeMethod,
  MakeEdgeMethodInput,
  MakeEdgeMethodOutput,
} from './methods/makeEdge'
import {
  removeEdgeMethod,
  RemoveEdgeMethodInput,
  RemoveEdgeMethodOutput,
} from './methods/removeEdge'

import { LogUsage } from '@kubelt/platform-middleware/log'

import { Analytics } from '@kubelt/platform-middleware/analytics'

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
  findNode: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(FindNodeMethodInput)
    .output(FindNodeMethodOutput)
    .query(findNodeMethod),
  getEdges: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetEdgesMethodInput)
    .output(GetEdgesMethodOutput)
    .query(getEdgesMethod),
  makeEdge: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(MakeEdgeMethodInput)
    .output(MakeEdgeMethodOutput)
    .mutation(makeEdgeMethod),
  removeEdge: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(RemoveEdgeMethodInput)
    .output(RemoveEdgeMethodOutput)
    .mutation(removeEdgeMethod),
})
