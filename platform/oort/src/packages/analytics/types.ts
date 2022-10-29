import { MetricIntakeType } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v2'
import {
  EventCreateRequest,
  EventCreateResponse,
} from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1'

export type SubmitParams = [string, string[], number, MetricIntakeType]

export type SubmitResult = void

export type EventParams = EventCreateRequest

export type EventResult = EventCreateResponse
