import { initTRPC } from '@trpc/server'
import { Context } from '../context'

import { GetGalleryInput, getGalleryMethod } from './methods/getGallery'
import { GetTokensInput, getTokensMethod } from './methods/getTokens'
import { IndexTokenInput, indexTokenMethod } from './methods/indexTokens'
import { SetGalleryInput, setGalleryMethod } from './methods/setGallery'
import {
  SetTokenMetadataInput,
  setTokenMetadataMethod,
} from './methods/setTokenMetadata'
import { SetTokensInput, setTokensMethod } from './methods/setTokens'

const t = initTRPC.context<Context>().create()

export const scopes = t.middleware(async ({ ctx, next }) => {
  // TODO: check scopes
  return next({ ctx })
})

export const logUsage = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start
  result.ok
    ? console.log('OK request timing:', { path, type, durationMs })
    : console.log('Non-OK request timing', { path, type, durationMs })
  return result
})

// TODO: add output types
export const appRouter = t.router({
  getGallery: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(GetGalleryInput)
    .query(getGalleryMethod),
  setGallery: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(SetGalleryInput)
    .mutation(setGalleryMethod),
  setToken: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(SetTokensInput)
    .mutation(setTokensMethod),
  getToken: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(GetTokensInput)
    .query(getTokensMethod),
  setTokenMetadata: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(SetTokenMetadataInput)
    .mutation(setTokenMetadataMethod),
  indexTokens: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(IndexTokenInput)
    .mutation(indexTokenMethod),
})

// TODO: move to package and export .d.ts file for deps
export type IndexerRouter = typeof appRouter
