const jose = require('jose')

const alg = 'ES256'

const kid = Date.now().toString()

const main = async () => {
  const generated = await jose.generateKeyPair(alg, { extractable: true })

  process.stdout.write(
    JSON.stringify({
      privateKey: {
        alg,
        kid,
        ...(await jose.exportJWK(generated.privateKey)),
      },
      publicKey: {
        alg,
        kid,
        ...(await jose.exportJWK(generated.publicKey)),
      },
    })
  )
}

main()
