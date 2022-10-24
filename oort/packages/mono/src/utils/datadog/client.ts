import { client, v2, v1 } from '@datadog/datadog-api-client'

import Fetch from './fetch'

const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: process.env.DATADOG_API_KEY,
    appKeyAuth: process.env.DATADOG_APP_KEY,
  },
  httpApi: new Fetch(),
})

export default {
  metrics: new v2.MetricsApi(configuration),
  events: new v1.EventsApi(configuration),
}
