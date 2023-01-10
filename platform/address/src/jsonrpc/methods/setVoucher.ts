import { z } from 'zod'

import { Context } from '../../context'

import { NFTarVoucherSchema } from '../validators/profile'
import { CryptoAddressProxyStub } from '../../nodes/crypto'

export const SetVoucherInput = NFTarVoucherSchema

type SetVoucherResult = z.infer<typeof SetVoucherInput>

export const setVoucherMethod = async ({
  input,
  ctx,
}: {
  input: SetVoucherResult
  ctx: Context
}): Promise<void> => {
  const nodeClient = ctx.address as CryptoAddressProxyStub
  return nodeClient.class.setVoucher(input)
}
