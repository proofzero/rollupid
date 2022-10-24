import { SigningKey } from '@ethersproject/signing-key'
import { keccak256 } from '@ethersproject/keccak256'

const getClient = async (t, capabilities = {}) => {
  const client = t.context.getClient()
  const { wallet } = t.context

  const {
    result: { nonce },
  } = await client.request('kb_getNonce', [
    wallet.address,
    '{{nonce}}',
    capabilities,
  ])

  const signingKey = new SigningKey(wallet.privateKey)

  const message = nonce
  const prefix = Buffer.from(
    `\u0019Ethereum Signed Message:\n${message.length}`,
    'utf-8'
  )

  const digest = keccak256(Buffer.concat([prefix, Buffer.from(message)]))
  const { compact: signature } = signingKey.signDigest(digest)

  const { result: jwt } = await client.request('kb_verifyNonce', [
    nonce,
    signature,
  ])

  return t.context.getClient({
    headers: {
      'KBT-Access-JWT-Assertion': jwt,
    },
  })
}

export default async (t) => {
  await t.test('storage', async (t) => {
    const unauthorizedClient = t.context.getClient()
    const noopClient = await getClient(t)
    const readClient = await getClient(t, { foo: ['read'] })
    const writeClient = await getClient(t, { foo: ['write'] })
    const readWriteClient = await getClient(t, { foo: ['read', 'write'] })

    const getParams = ['foo', 'bar']
    const setParams = ['foo', 'bar', 'baz']

    await t.test('kb_getData unauthorized read on foo', async (t) => {
      const response = await unauthorizedClient.request('kb_getData', getParams)

      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_setData unauthorized write on foo', async (t) => {
      const response = await unauthorizedClient.request('kb_setData', setParams)
      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_getData noop read on foo', async (t) => {
      const response = await noopClient.request('kb_getData', ['foo', 'bar'])
      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_setData noop write on foo', async (t) => {
      const response = await noopClient.request('kb_setData', setParams)
      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_getData read on foo with read', async (t) => {
      const response = await readClient.request('kb_getData', getParams)
      t.hasProp(response, 'result', 'response is a result')
    })

    await t.test('kb_getData read on foo with write', async (t) => {
      const response = await writeClient.request('kb_getData', getParams)
      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_getData read on foo with read+write', async (t) => {
      const response = await readWriteClient.request('kb_getData', getParams)
      t.hasProp(response, 'result', 'response is a result')
    })

    await t.test('kb_setData write on foo with read', async (t) => {
      const response = await readClient.request('kb_setData', setParams)
      t.hasProp(response, 'error', 'response is an error')
    })

    await t.test('kb_setData write on foo with write', async (t) => {
      const response = await writeClient.request('kb_setData', setParams)
      t.hasProp(response, 'result', 'response is a result')
    })

    await t.test('kb_setData write on foo with read+write', async (t) => {
      const response = await readWriteClient.request('kb_setData', setParams)
      t.hasProp(response, 'result', 'response is a result')
    })
  })

  await t.test(
    'storage and retrieval with equivalent paths are equal',
    async (t) => {
      const readWriteClient = await getClient(t, { foo: ['read', 'write'] })

      const getParamsList = ['foo', 'bar']
      const setParamsList = ['foo', 'bar.luf', 'baz']

      const testObject = {
        luf: 'example',
      }

      await t.test('kb_setData with a dotted path', async (t) => {
        const setResponse = await readWriteClient.request(
          'kb_setData',
          setParamsList
        )
        t.hasProp(setResponse, 'result', 'response is a result')

        const getResponse = await readWriteClient.request(
          'kb_getData',
          getParamsList
        )
        t.hasProp(getResponse, 'result', 'response is a result')

        t.equal(
          getResponse.result.value.luf,
          setResponse.result.value,
          'equivalent dotted paths are equal'
        )
      })

      await t.test('kb_setData for an entire object', async (t) => {
        await readWriteClient.request('kb_setData', ['foo', 'bar', testObject])
        const response = await readWriteClient.request('kb_getData', [
          'foo',
          'bar.luf',
        ])
        t.equal(
          response.result.value,
          testObject.luf,
          'equivalent dotted paths are equal'
        )
      })
    }
  )
}
