import createStarbaseClient from '@kubelt/platform-clients/starbase'

export function getStarbaseClient(jwt: string) {
  return createStarbaseClient(Starbase, {
    headers: {
      'KBT-Access-JWT-Assertion': jwt,
    },
  })
}
