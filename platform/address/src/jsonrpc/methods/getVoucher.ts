import { z } from 'zod'

import { Context } from '../../context'

import { NFTarVoucherSchema } from '../validators/profile'
import { CryptoAddressProxyStub } from '../../nodes/crypto'

export const GetVoucherOutput = NFTarVoucherSchema.optional()

type GetVoucherResult = z.infer<typeof GetVoucherOutput>

export const getVoucherMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<GetVoucherResult | undefined> => {
  const nodeClient = ctx.address as CryptoAddressProxyStub
  const voucher = nodeClient.class.getVoucher()
  return voucher
}
