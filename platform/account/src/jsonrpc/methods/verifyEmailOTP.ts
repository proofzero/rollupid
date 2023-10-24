import { z } from 'zod'
import { Context } from '../../context'
import { AccountNode } from '../../nodes'
import EmailAccount from '../../nodes/email'

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
  const emailAccountNode = new EmailAccount(ctx.account as AccountNode, ctx.env)
  const successfulVerification = await emailAccountNode.verifyCode(code, state)

  return successfulVerification
}
