#!/usr/bin/env node

const { readFileSync } = require('node:fs')
const jose = require('jose')

const alg = 'ES256'

const teamId = process.argv[2] || process.env.TEAM_ID
const clientId = process.argv[3] || process.env.CLIENT_ID
const kid = process.argv[4] || process.env.KID
const keyFile = process.argv[5]

const privateKey = keyFile
  ? readFileSync(keyFile, 'utf8')
  : process.env.PRIVATE_KEY

if (!privateKey) {
  throw new Error('missing private key')
}

jose.importPKCS8(privateKey, alg).then((privateKey) => {
  new jose.SignJWT({})
    .setProtectedHeader({ alg, kid })
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
