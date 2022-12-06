import createStarbaseClient from '@kubelt/platform-clients/starbase'

export function getStarbaseClient() {
  return createStarbaseClient(Starbase)
}
