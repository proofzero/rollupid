import { fromBase64, toBase64 } from './buffer'
import { encrypt, decrypt, importKey } from './crypto'

type EncryptSessionResult = {
  cipher: string
  iv: string
}

type DecryptSessionResult = string

const algorithm = { name: 'AES-GCM' }

export const encryptSession = async (
  keyData: string,
  data: string
): Promise<EncryptSessionResult> => {
  const encoder = new TextEncoder()
  const key = await importKey(fromBase64(keyData), algorithm)
  const result = await encrypt(key, algorithm, encoder.encode(data))
  return {
    cipher: toBase64(result.cipher),
    iv: toBase64(result.iv),
  }
}

export const decryptSession = async (
  keyData: string,
  cipher: string,
  iv: string
): Promise<DecryptSessionResult> => {
  const key = await importKey(fromBase64(keyData), algorithm)
  return decrypt(key, algorithm, fromBase64(cipher), fromBase64(iv))
}
