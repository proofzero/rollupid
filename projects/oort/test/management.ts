export default async (t) => {
  await t.test('management', async (t) => {
    await t.test('claims', async (t) => {
      const client = t.context.getClient({
        headers: {
          'KBT-Access-JWT-Assertion': t.context.auth.jwt,
        },
      })

      // const claim = "test.claim"
      // let response = await client.request('kb_grantCoreClaims', [ claim ])
      // t.same(response.result, [ claim ], 'claims are returned')

      const response = await client.request('kb_getCoreClaims', [])
      t.equal(Boolean(response.result), true, 'response is a result')
      // t.same(response.result, [ claim ], 'claims are persisted')
      t.end()
    })
  })
}
