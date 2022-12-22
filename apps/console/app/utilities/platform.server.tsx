import createStarbaseClient from '@kubelt/platform-clients/starbase'

export function getStarbaseClient(jwt: string): StarbaseClient {
  return createStarbaseClient(Starbase, {
    headers: {
      'KBT-Access-JWT-Assertion': jwt,
    },
  })
}

export type StarbaseClient = ReturnType<typeof createStarbaseClient>