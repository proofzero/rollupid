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
import { createInvoice } from '@proofzero/utils/billing/stripe'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '@proofzero/platform.identity/src/nodes'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { getApplicationNodeByClientId } from '@proofzero/platform.starbase/src/nodes/application'
import { packageTypeToTopUpPriceID } from '@proofzero/utils/external-app-data'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'

export const GetExternalAppDataInputSchema = AppClientIdParamSchema
type GetExternalAppDataInput = z.infer<typeof GetExternalAppDataInputSchema>

export const GetExternalAppDataOutputSchema = z.any()
type GetExternalAppDataOutput = z.infer<typeof GetExternalAppDataOutputSchema>

export const getExternalAppDataMethod = async ({
  input,
  ctx,
}: {
  input: GetExternalAppDataInput
  ctx: Context
}): Promise<GetExternalAppDataOutput> => {
  const identityURN = ctx.identityURN as IdentityURN
  const { clientId } = input

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

  const externalStorageReadKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataRead
  )

  const { numValue: externalStorageReadNumVal, metadata } =
    await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageReadKey)

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

  if (
    externalStorageReadNumVal >= 0.8 * metadata.limit &&
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

    await ctx.env.UsageKV.put(
      externalStorageReadKey,
      `${externalStorageReadNumVal + 1}`,
      {
        metadata,
      }
    )

    await appDO.class.setExternalAppDataPackageStatus(
      ExternalAppDataPackageStatus.ToppingUp
    )
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
  } else if (externalStorageReadNumVal >= metadata.limit) {
    throw new BadRequestError({
      message: 'external storage read limit reached',
    })
  } else {
    await ctx.env.UsageKV.put(
      externalStorageReadKey,
      `${externalStorageReadNumVal + 1}`,
      {
        metadata,
      }
    )
  }

  return node.storage.get('externalAppData')
}
