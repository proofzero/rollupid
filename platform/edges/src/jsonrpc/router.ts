import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { errorFormatter } from '@proofzero/utils/trpc'

import { Context } from '../context'

import {
  findNodeBatchMethod,
  FindNodeBatchMethodInput,
  FindNodeBatchMethodOutput,
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

import { LogUsage } from '@proofzero/platform-middleware/log'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import {
  updateNodeCompsMethod,
  UpdateNodeCompsMethodInput,
  UpdateNodeCompsMethodOutput,
} from './methods/updateNodeComps'
import {
  deleteNodeMethod,
  DeleteNodeMethodInput,
  DeleteNodeMethodOutput,
} from './methods/deleteNode'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  findNode: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(FindNodeMethodInput)
    .output(FindNodeMethodOutput)
    .query(findNodeMethod),
  findNodeBatch: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(FindNodeBatchMethodInput)
    .output(FindNodeBatchMethodOutput)
    .query(findNodeBatchMethod),
  deleteNode: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(DeleteNodeMethodInput)
    .output(DeleteNodeMethodOutput)
    .mutation(deleteNodeMethod),
  updateNode: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(UpdateNodeCompsMethodInput)
    .output(UpdateNodeCompsMethodOutput)
    .mutation(updateNodeCompsMethod),
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
