import { SigningKey } from '@ethersproject/signing-key'
import { keccak256 } from '@ethersproject/keccak256'

export default async (t) => {
  t.context.auth = {}

  await t.test('auth', async (t) => {
    await t.test('kb_getNonce', async (t) => {
      const client = t.context.getClient()
      const { wallet } = t.context
      const response = await client.request('kb_getNonce', [
        wallet.address,
        '{{nonce}}',
        { foo: ['read', 'write'] },
      ])
      t.equal(Boolean(response.result), true, 'response is a result')
      const { nonce } = response.result
      Object.assign(t.context.auth, { nonce })
    })

    await t.test('kb_verifyNonce', async (t) => {
      const client = t.context.getClient()

      const { wallet } = t.context
      const signingKey = new SigningKey(wallet.privateKey)

      const { nonce } = t.context.auth
      const message = nonce

      const prefix = Buffer.from(
        `\u0019Ethereum Signed Message:\n${message.length}`,
        'utf-8'
      )

      const digest = keccak256(Buffer.concat([prefix, Buffer.from(message)]))
      const { compact: signature } = signingKey.signDigest(digest)

      const response = await client.request('kb_verifyNonce', [
        nonce,
        signature,
      ])
      t.equal(Boolean(response.result), true, 'response is a result')
      t.context.auth.jwt = response.result
    })
  })
}
