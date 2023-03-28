import { z } from 'zod'
import { Context } from '../../context'
import { AddressNode } from '../../nodes'
import EmailAddress from '../../nodes/email'

export const VerifyEmailOTPInput = z.object({
  code: z.string(),
  state: z.string(),
})

export const VerifyEmailOTPOutput = z.boolean()

type GenerateEmailOTPParams = z.infer<typeof VerifyEmailOTPInput>

export const verifyEmailOTPMethod = async ({
  input,
  ctx,
}: {
  input: GenerateEmailOTPParams
  ctx: Context
}): Promise<z.infer<typeof VerifyEmailOTPOutput>> => {
  const { code, state } = input
  const emailAddressNode = new EmailAddress(ctx.address as AddressNode)
  const successfulVerification = await emailAddressNode.verifyCode(code, state)

  return successfulVerification
}
