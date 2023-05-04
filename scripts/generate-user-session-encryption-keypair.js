const crypto = require('crypto')

const key = crypto.generateKeySync('aes', { length: 256 })
console.log(key.export().toString('base64'))
