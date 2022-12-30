// @kubelt/types:index.ts

/**
 * Platform types.
 */

// The current canonical location for this enum is:
// import { CryptoAddressType } from '@kubelt/platform.address'
/**
 * The specific type of a crypto address owned by a platform account.
 */
export enum CryptoAddressType {
  // An Ethereum wallet address.
  Ethereum = 'ethereum',
  // An Ethereum .eth address.
  ETH = 'eth',
}
