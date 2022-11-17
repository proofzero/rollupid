export const seviceBindings = true
declare global {
  const Account: Fetcher
  const Galaxy: Fetcher
  const Access: Fetcher
  const Starbase: Fetcher

  const THREEID_APP_URL: string
}
