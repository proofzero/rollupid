import {generateKeyPairFromSeed, KeyPair} from '@stablelib/ed25519'
import {ethers} from 'ethers'
import {checkSessionStorage} from '../utils'

// TODO: SDK
const generateSeedFromPhrase = (phrase: string): Uint8Array => {
  // needs 256bit for ed25519 seed
  // keccak256 produces just that
  // heavily used in Ethereum
  const hashedSignedMsg = ethers.utils.keccak256(phrase)
  const hashedSignedMsgArr = ethers.utils.arrayify(hashedSignedMsg)

  return hashedSignedMsgArr
}

// TODO: SDK
const generateKeyPair = (seed: Uint8Array) => generateKeyPairFromSeed(seed)

const persistKeyPair = (account: string, keyPair: KeyPair) => {
  checkSessionStorage()

  let existingEntries = Object.create(null)
  if (sessionStorage.getItem('kupairs')) {
    existingEntries = JSON.parse(sessionStorage.getItem('kupairs'))
  }

  // JSON.stringify serializes Uint8Arrays to objects
  // bad behavior created upstream
  // nicer to have hex
  const mappedKeyPair: {
    publicKey: string
    secretKey: string
  } = {
    publicKey: ethers.utils.hexlify(keyPair.publicKey),
    secretKey: ethers.utils.hexlify(keyPair.secretKey),
  }

  existingEntries[account] = mappedKeyPair

  sessionStorage.setItem('kupairs', JSON.stringify(existingEntries))
}

const loadPersistedKeyPair = (account: string): KeyPair => {
  checkSessionStorage()

  let existingEntries = null
  if (sessionStorage.getItem('kupairs')) {
    existingEntries = JSON.parse(sessionStorage.getItem('kupairs'))
  } else {
    return undefined
  }

  if (!existingEntries[account]) {
    return undefined
  }

  const mappedKeyPair: KeyPair = {
    publicKey: ethers.utils.arrayify(existingEntries[account].publicKey),
    secretKey: ethers.utils.arrayify(existingEntries[account].secretKey),
  }

  return mappedKeyPair
}

// TODO: SDK
// const jsonToCid = (jsonEncodedData: string): void => {}

export default {
  generateSeedFromPhrase,
  generateKeyPair,
  persistKeyPair,
  loadPersistedKeyPair,
}
