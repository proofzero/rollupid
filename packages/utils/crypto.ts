type EncryptResult = {
  cipher: ArrayBuffer
  iv: ArrayBuffer
}

type DecryptResult = string

export const encrypt = async (
  key: CryptoKey,
  algorithm: SubtleCryptoEncryptAlgorithm,
  data: Uint8Array
): Promise<EncryptResult> => {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const cipher = await crypto.subtle.encrypt({ ...algorithm, iv }, key, data)
  return {
    cipher,
    iv,
  }
}

export const decrypt = async (
  key: CryptoKey,
  algorithm: SubtleCryptoEncryptAlgorithm,
  cipher: Uint8Array,
  iv: Uint8Array
): Promise<DecryptResult> => {
  const data = await crypto.subtle.decrypt(
    { ...algorithm, iv: iv },
    key,
    cipher
  )

  return String.fromCharCode.apply(
    null,
    new Uint8Array(data) as unknown as number[]
  )
}

export const importKey = (
  data: Uint8Array,
  algorithm: SubtleCryptoImportKeyAlgorithm
): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', data, algorithm, false, ['encrypt', 'decrypt'])
