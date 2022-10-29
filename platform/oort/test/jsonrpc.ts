export default async (t) => {
  await t.test('json-rpc', async (t) => {
    await t.test('rpc.discover', async (t) => {
      const client = t.context.getClient()
      const response = await client.request('rpc.discover', [])
      t.equal(Boolean(response.result), true, 'response is a result')
    })

    await t.test('kb_ping', async (t) => {
      const client = t.context.getClient()
      const response = await client.request('kb_ping', [])
      t.equal(Boolean(response.result), true, 'response is a result')
      t.equal(response.result, 'pong', 'response is pong')
    })

    await t.test('kb_pong', async (t) => {
      const client = t.context.getClient()
      const response = await client.request('kb_pong', [])
      t.equal(Boolean(response.error), true, 'response is an error')
    })
  })
}
