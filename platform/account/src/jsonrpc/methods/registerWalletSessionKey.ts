import { z } from 'zod'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonMumbai as chain } from 'viem/chains'
import { addressToEmptyAccount, createKernelAccount } from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import {
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from '@zerodev/session-key'

import { Hex } from '../validators/wallet'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'

import { PaymasterSchema } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { BadRequestError, InternalServerError } from '@proofzero/errors'

import { ZERODEV_SESSION_KEY_TTL } from '../../constants'
import { generateSmartWalletAccountUrn } from '../../utils'

export const RegisterSessionKeyInput = z.object({
  sessionKeyAddress: Hex,
  smartContractWalletAddress: z.string(),
  paymaster: PaymasterSchema,
})

export const RegisterSessionKeyOutput = z.string()

type RegisterSessionKeyParams = z.infer<typeof RegisterSessionKeyInput>

type RegisterSessionKeyResult = z.infer<typeof RegisterSessionKeyOutput>

export const registerSessionKeyMethod = async ({
  input,
  ctx,
}: {
  input: RegisterSessionKeyParams
  ctx: Context
}): Promise<RegisterSessionKeyResult> => {
  // This method is being called only from galaxy
  // All authorization checks are done in galaxy

  const { paymaster, smartContractWalletAddress, sessionKeyAddress } = input

  const { baseAccountURN } = generateSmartWalletAccountUrn(
    smartContractWalletAddress,
    '' // empty string because we only care about base urn
  )

  const smartContractWalletNode = initAccountNodeByName(
    baseAccountURN,
    ctx.env.Account
  )

  const ownerPrivateKey = await smartContractWalletNode.storage.get<Hex>(
    'privateKey'
  )

  if (!ownerPrivateKey) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  if (paymaster && paymaster.provider === 'zerodev') {
    try {
      const signer = privateKeyToAccount(ownerPrivateKey)

      const publicClient = createPublicClient({
        chain,
        transport: http(),
      })

      const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAddress)

      const sessionKeyAccount = await createKernelAccount(publicClient, {
        plugins: {
          defaultValidator: await signerToEcdsaValidator(publicClient, {
            signer,
          }),
          validator: await signerToSessionKeyValidator(publicClient, {
            signer: emptySessionKeySigner,
            validatorData: { validUntil: Date.now() + ZERODEV_SESSION_KEY_TTL },
          }),
        },
      })

      return serializeSessionKeyAccount(sessionKeyAccount)
    } catch (e) {
      throw new InternalServerError({ message: 'Failed to create session key' })
    }
  }

  return ''
}
