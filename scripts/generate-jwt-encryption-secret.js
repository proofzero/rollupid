const jose = require('jose')

const main = async () => {
  const secret = await jose.generateSecret('HS256')
  console.log(jose.base64url.encode(secret.export()))
}

main()
