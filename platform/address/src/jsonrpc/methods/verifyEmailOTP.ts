import { z } from 'zod'
import { Context } from '../../context'
import { AddressNode } from '../../nodes'
import EmailAddress from '../../nodes/email'
import { appRouter } from '../router'

export const VerifyEmailOTPInput = z.object({
  code: z.string(),
  state: z.string(),
  jwt: z.string().optional(),
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
  const { code, state, jwt } = input
  const emailAddressNode = new EmailAddress(ctx.address as AddressNode)
  const successfulVerification = await emailAddressNode.verifyCode(code, state)
  if (successfulVerification) {
    const caller = appRouter.createCaller(ctx)
    const { accountURN, existing } = await caller.resolveAccount({
      jwt,
      force: false,
    })
    //TODO: Authentication would happen based on the returned accountURN
  }
  return successfulVerification
}
