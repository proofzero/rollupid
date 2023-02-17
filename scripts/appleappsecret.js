const { readFileSync } = require('node:fs')
const jose = require('jose')

const alg = 'ES256'

jose
  .importPKCS8(readFileSync('AuthKey_6PS7LZ3RHM.p8', 'utf8'), alg)
  .then((privateKey) => {
    const teamId = 'CJPKB2FGY3'
    const clientId = 'id.rollup.passport-local'

    new jose.SignJWT({})
      .setProtectedHeader({ alg })
      .setAudience('https://appleid.apple.com')
      .setExpirationTime('180 days')
      .setIssuedAt()
      .setIssuer(teamId)
      .setSubject(clientId)
      .sign(privateKey)
      .then((jwt) => {
        process.stdout.write(`${jwt}\n`)
      })
  })
