export const POSTHOG_PROXY_HOST = 'https://posthog.rollup.id'

export const posthogCall = async ({
  eventName,
  apiKey,
  distinctId,
  properties,
}: {
  eventName: string
  apiKey: string
  distinctId: string
  properties?: Record<string, any>
}) => {
  const body = JSON.stringify({
    api_key: apiKey,
    event: eventName,
    distinct_id: distinctId,
    properties: properties || {},
  })

  const init = {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  await fetch(POSTHOG_PROXY_HOST, init)
}
