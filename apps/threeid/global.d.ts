export const seviceBindings = true

declare global {
  const NODE_ENV: string
  const COOKIE_DOMAIN: string
  const SESSON_SECRET: string
  const PASSPORT_URL: String
  const MINTPFP_CONTRACT_ADDRESS: string
  const VALID_CHAIN_ID_NAME: string
  const TOKEN_NFTAR: string
  const NFTAR_URL: string

  const Galaxy: Fetcher
  const Address: Fetcher
}
