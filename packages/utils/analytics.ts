export const createAnalyticsEvent = async ({
  eventName,
  apiKey,
  distinctId,
  properties,
  groups,
}: {
  eventName: string
  apiKey: string
  distinctId: string
  groups?: Record<string, any>
  properties?: Record<string, any>
}) => {
  const body = JSON.stringify({
    api_key: apiKey,
    event: eventName,
    distinct_id: distinctId,
    properties: { ...properties, $groups: groups },
  })

  const init = {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  await fetch(`https://app.posthog.com/e/`, init)
}
