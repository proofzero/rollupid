import { MetricPoint } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v2'

import {
  COUNT,
  MetricIntakeType,
} from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v2/models/MetricIntakeType'

import { client } from '../../utils/datadog'

export const metricSubmit = (
  metric: string,
  tags: string[] = [],
  value = 1,
  type: MetricIntakeType = COUNT
): void => {
  if (!process.env.DATADOG_API_KEY) {
    return
  }

  const host = process.env.SITE
  const timestamp = Math.floor(Date.now() / 1000)
  const points: MetricPoint[] = [{ timestamp, value }]
  tags.push(`host:${host}`)
  client.metrics.submitMetrics({
    body: {
      series: [
        {
          metric,
          points,
          tags,
          type,
        },
      ],
    },
  })
}

export const eventSubmit = async (
  title: string,
  text: string,
  tags: string[] = [],
  aggregationKey = null
): Promise<void> => {
  if (!process.env.DATADOG_API_KEY) {
    return
  }

  const host = process.env.SITE
  tags.push(`host:${host}`)
  client.events.createEvent({
    body: {
      title,
      text,
      tags,
      aggregationKey,
    },
  })
}
