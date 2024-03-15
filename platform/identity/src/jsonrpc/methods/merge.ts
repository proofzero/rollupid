import { intersection } from 'lodash'
import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { EDGE_AUTHORIZES } from '@proofzero/platform.authorization/src/constants'
import { EDGE_APPLICATION } from '@proofzero/platform.starbase/src/types'
import { initAuthorizationNodeByName } from '@proofzero/platform.authorization/src/nodes'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

import { ConflictError } from '@proofzero/errors'
import {
  EDGE_MEMBER_OF_IDENTITY_GROUP,
  EDGE_PAYS_APP,
} from '@proofzero/types/graph'

import { type AnyURN } from '@proofzero/urns'
import { type AccountURN } from '@proofzero/urns/account'
import {
  AuthorizationURNSpace,
  type AuthorizationURN,
} from '@proofzero/urns/authorization'
import { IdentityURNSpace, type IdentityURN } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initIdentityNodeByName } from '../../nodes'

export const MergeInput = z.object({
  source: IdentityURNInput,
  target: IdentityURNInput,
})
type MergeInput = z.infer<typeof MergeInput>

export const MergeOutput = z.void()
type MergeOutput = z.infer<typeof MergeOutput>

type MergeParams = {
  input: MergeInput
  ctx: Context
}

type MergeResult = MergeOutput

interface MergeMethod {
  (params: MergeParams): MergeResult
}

export const mergeMethod: MergeMethod = async ({ input, ctx }) => {
  const { source, target } = input

  await Promise.all([
    checkAuthorizationConflicts(source, target, ctx),
    checkIdentityPays(source, ctx),
  ])

  await Promise.all([
    moveAccounts(source, target, ctx),
    moveAuthorizations(source, target, ctx),
    moveIdentityGroupEdges(source, target, ctx),
    moveIdentityOwnsAppEdges(source, target, ctx),
    moveIdentityPaysAppEdges(source, target, ctx),
  ])
  await setIdentityForward(source, target, ctx)
}

const checkAuthorizationConflicts = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)

  const { edges: sourceIdentityAuthorizationEdges } =
    await caller.edges.getEdges({
      query: {
        src: { baseUrn: sourceIdentityURN },
        tag: EDGE_AUTHORIZES,
      },
    })

  const { edges: targetIdentityAuthorizationEdges } =
    await caller.edges.getEdges({
      query: {
        src: { baseUrn: targetIdentityURN },
        tag: EDGE_AUTHORIZES,
      },
    })

  const getClientIds = (
    edges: Array<{
      dst: {
        baseUrn: AnyURN
      }
    }>
  ): Array<string> => {
    return edges.map((e) => {
      const nss = AuthorizationURNSpace.decode(
        e.dst.baseUrn as AuthorizationURN
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, clientId] = nss.split('@')
      return clientId
    })
  }

  const sourceIdentityClientIds = getClientIds(sourceIdentityAuthorizationEdges)
  const targetIdentityClientIds = getClientIds(targetIdentityAuthorizationEdges)

  const conflicts = intersection(
    sourceIdentityClientIds,
    targetIdentityClientIds
  )

  if (conflicts.length === 0) return

  throw new ConflictError({
    message: 'Identities have authorizations to same applications',
  })
}

const checkIdentityPays = async (identityURN: IdentityURN, ctx: Context) => {
  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: identityURN },
      tag: EDGE_PAYS_APP,
    },
  })

  if (edges.length === 0) return

  throw new ConflictError({
    message:
      'Source identity has a payment subscription.\
 Please transfer your application(s) to an identity group first.',
  })
}

async function moveAccounts(
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: sourceIdentityURN },
      tag: EDGE_ACCOUNT,
    },
  })

  const urns = edges.map((e) => e.dst.baseUrn as AccountURN)
  for (const account3RN of urns) {
    const caller = router.createCaller({ ...ctx, account3RN })
    await caller.account.setIdentity(targetIdentityURN)
  }
}

const moveAuthorizations = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: sourceIdentityURN },
      tag: EDGE_AUTHORIZES,
    },
  })

  const urns = edges.map((e) => {
    const sourceAuthorizationURN = e.dst.baseUrn as AuthorizationURN
    const sourceNSS = AuthorizationURNSpace.decode(sourceAuthorizationURN)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, clientId] = sourceNSS.split('@')
    const targetNSS = `${IdentityURNSpace.decode(
      targetIdentityURN
    )}@${clientId}`
    const targetAuthorizationURN =
      AuthorizationURNSpace.componentizedUrn(targetNSS)

    return {
      sourceAuthorizationURN,
      targetAuthorizationURN,
    }
  })

  await migrateAuthorizationNodes(urns, ctx)
  await migrateAuthorizationEdges(
    sourceIdentityURN,
    targetIdentityURN,
    urns,
    ctx
  )
}

type AuthorizationURNs = Array<{
  sourceAuthorizationURN: AuthorizationURN
  targetAuthorizationURN: AuthorizationURN
}>

const migrateAuthorizationNodes = async (
  urns: AuthorizationURNs,
  ctx: Context
) => {
  const nodes = urns.map(
    ({ sourceAuthorizationURN, targetAuthorizationURN }) => ({
      source: initAuthorizationNodeByName(
        sourceAuthorizationURN,
        ctx.env.Authorization
      ),
      target: initAuthorizationNodeByName(
        targetAuthorizationURN,
        ctx.env.Authorization
      ),
    })
  )

  return nodes.map(async ({ source, target }) => {
    const storage = await source.storage.list()
    await target.storage.put(Object.fromEntries(storage.entries()))
    await source.storage.deleteAll()
  })
}

const migrateAuthorizationEdges = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  urns: AuthorizationURNs,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)
  return urns.map(
    async ({ sourceAuthorizationURN, targetAuthorizationURN }) => {
      await caller.edges.removeEdge({
        src: sourceIdentityURN,
        tag: EDGE_AUTHORIZES,
        dst: sourceAuthorizationURN,
      })

      await caller.edges.deleteNode({ urn: sourceAuthorizationURN })

      const sourceNSS = AuthorizationURNSpace.decode(sourceAuthorizationURN)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, clientId] = sourceNSS.split('@')

      await caller.edges.makeEdge({
        src: targetIdentityURN,
        tag: EDGE_AUTHORIZES,
        dst: AuthorizationURNSpace.componentizedUrn(
          AuthorizationURNSpace.decode(targetAuthorizationURN),
          { client_id: clientId }
        ),
      })
    }
  )
}

const moveIdentityOwnsAppEdges = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: sourceIdentityURN },
      tag: EDGE_APPLICATION,
    },
  })

  await Promise.all(
    edges.map(async (edge) => {
      await caller.edges.removeEdge({
        src: edge.src.baseUrn,
        tag: EDGE_APPLICATION,
        dst: edge.dst.baseUrn,
      })
    })
  )

  const appURNs = edges.map((edge) => edge.dst.baseUrn)
  await Promise.all(
    appURNs.map(async (appURN) => {
      const { edges } = await caller.edges.getEdges({
        query: {
          src: { baseUrn: targetIdentityURN },
          tag: EDGE_APPLICATION,
          dst: { baseUrn: appURN },
        },
      })

      if (edges.length > 0) return

      await caller.edges.makeEdge({
        src: targetIdentityURN,
        tag: EDGE_APPLICATION,
        dst: appURN,
      })
    })
  )
}

const moveIdentityGroupEdges = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: sourceIdentityURN },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  await Promise.all(
    edges.map(async (edge) => {
      await caller.edges.removeEdge({
        src: edge.src.baseUrn,
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        dst: edge.dst.baseUrn,
      })
    })
  )

  const identityGroupURNs = edges.map((edge) => edge.dst.baseUrn)
  await Promise.all(
    identityGroupURNs.map(async (identityGroupURN) => {
      const { edges } = await caller.edges.getEdges({
        query: {
          src: { baseUrn: targetIdentityURN },
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
          dst: { baseUrn: identityGroupURN },
        },
      })

      if (edges.length > 0) return

      await caller.edges.makeEdge({
        src: targetIdentityURN,
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        dst: identityGroupURN,
      })
    })
  )
}

const moveIdentityPaysAppEdges = async (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: sourceIdentityURN },
      tag: EDGE_PAYS_APP,
    },
  })

  await Promise.all(
    edges.map(async (edge) => {
      await caller.edges.removeEdge({
        src: edge.src.baseUrn,
        tag: EDGE_PAYS_APP,
        dst: edge.dst.baseUrn,
      })
    })
  )

  const appURNs = edges.map((edge) => edge.dst.baseUrn)
  await Promise.all(
    appURNs.map(async (appURN) => {
      const { edges } = await caller.edges.getEdges({
        query: {
          src: { baseUrn: targetIdentityURN },
          tag: EDGE_PAYS_APP,
          dst: { baseUrn: appURN },
        },
      })

      if (edges.length > 0) return

      await caller.edges.makeEdge({
        src: targetIdentityURN,
        tag: EDGE_PAYS_APP,
        dst: appURN,
      })
    })
  )
}

const setIdentityForward = (
  sourceIdentityURN: IdentityURN,
  targetIdentityURN: IdentityURN,
  ctx: Context
) => {
  const sourceIdentityNode = initIdentityNodeByName(
    sourceIdentityURN,
    ctx.env.Identity
  )
  return sourceIdentityNode.class.setForwardIdentityURN(targetIdentityURN)
}
