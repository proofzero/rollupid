import { z } from 'zod'

import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import {
  UsageCategory,
  generateUsageKey,
  getStoredUsageWithMetadata,
} from '@proofzero/utils/usage'
import {
  initIdentityNodeByName,
  initIdentityGroupNodeByName,
} from '@proofzero/platform.identity/src/nodes'
import { getApplicationNodeByClientId } from '@proofzero/platform.starbase/src/nodes/application'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { createInvoice } from '@proofzero/utils/billing/stripe'
import { packageTypeToTopUpPriceID } from '@proofzero/utils/external-app-data'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'

export const usageGate = async (
  ctx: Context,
  identityURN: IdentityURN,
  clientID: string,
  storageKey: string
) => {
  const { numValue: externalStorageNumVal, metadata } =
    await getStoredUsageWithMetadata(ctx.env.UsageKV, storageKey)

  const appDO = await getApplicationNodeByClientId(
    clientID,
    ctx.env.StarbaseApp
  )
  const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
  if (!externalAppDataPackageDefinition) {
    throw new InternalServerError({
      message: 'external app data package not found',
    })
  }

  if (
    externalStorageNumVal >= 0.8 * metadata.limit &&
    externalAppDataPackageDefinition.autoTopUp &&
    externalAppDataPackageDefinition.status ===
      ExternalAppDataPackageStatus.Enabled
  ) {
    let ownerNode
    if (IdentityURNSpace.is(identityURN)) {
      ownerNode = initIdentityNodeByName(identityURN, ctx.env.Identity)
    } else if (IdentityGroupURNSpace.is(identityURN)) {
      ownerNode = initIdentityGroupNodeByName(
        identityURN,
        ctx.env.IdentityGroup
      )
    } else {
      throw new BadRequestError({
        message: `URN type not supported`,
      })
    }

    const stripePaymentData = await ownerNode.class.getStripePaymentData()
    const customerID = stripePaymentData?.customerID
    if (!customerID) {
      throw new InternalServerError({
        message: 'stripe customer id not found',
      })
    }

    await ctx.env.UsageKV.put(storageKey, `${externalStorageNumVal + 1}`, {
      metadata,
    })

    await createInvoice(
      ctx.env.SECRET_STRIPE_API_KEY,
      customerID,
      externalAppDataPackageDefinition.packageDetails.subscriptionID,
      packageTypeToTopUpPriceID(
        ctx.env,
        externalAppDataPackageDefinition.packageDetails.packageType
      ),
      true
    )
  } else if (externalStorageNumVal >= metadata.limit) {
    throw new BadRequestError({
      message: 'external storage write limit reached',
    })
  } else {
    await ctx.env.UsageKV.put(storageKey, `${externalStorageNumVal + 1}`, {
      metadata,
    })
  }
}

export const SetExternalAppDataInputSchema = AppClientIdParamSchema.extend({
  payload: z.any(),
})
type SetExternalAppDataInput = z.infer<typeof SetExternalAppDataInputSchema>

export const setExternalAppDataMethod = async ({
  input,
  ctx,
}: {
  input: SetExternalAppDataInput
  ctx: Context
}) => {
  const identityURN = ctx.identityURN as IdentityURN
  const { clientId, payload } = input

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id',
    })

  if (!IdentityURNSpace.is(identityURN))
    throw new BadRequestError({
      message: 'missing identity',
    })

  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const node = initAuthorizationNodeByName(urn, ctx.env.Authorization)

  const externalStorageWriteKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataWrite
  )

  await usageGate(ctx, identityURN, clientId, externalStorageWriteKey)

  return node.storage.put('externalAppData', payload)
}
