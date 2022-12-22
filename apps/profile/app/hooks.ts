import { useMatches } from '@remix-run/react'

export const useRouteData = <T>(routeId: string): T | undefined => {
  const matches = useMatches()
  const data = matches.find((match) => match.id === routeId)?.data

  return data as T | undefined
}
