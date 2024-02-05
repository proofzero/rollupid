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

  const { numValue: externalStorageWriteNumVal, metadata } =
    await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageWriteKey)

  if (externalStorageWriteNumVal >= metadata.limit) {
    throw new BadRequestError({
      message: 'external storage read limit reached',
    })
  } else if (externalStorageWriteNumVal >= 0.8 * metadata.limit) {
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

    const appDO = await getApplicationNodeByClientId(
      clientId,
      ctx.env.StarbaseApp
    )
    const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
    if (!externalAppDataPackageDefinition) {
      throw new InternalServerError({
        message: 'external app data package not found',
      })
    }

    if (externalAppDataPackageDefinition.autoTopUp) {
      await createInvoice(
        ctx.env.SECRET_STRIPE_API_KEY,
        customerID,
        externalAppDataPackageDefinition.packageDetails.subscriptionID,
        ctx.env.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID,
        true
      )
    }
  }

  await Promise.all([
    node.storage.put('externalAppData', payload),
    ctx.env.UsageKV.put(
      externalStorageWriteKey,
      `${externalStorageWriteNumVal + 1}`,
      {
        metadata,
      }
    ),
  ])
}
