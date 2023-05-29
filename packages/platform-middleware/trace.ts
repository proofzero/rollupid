import generateRandomString from '@proofzero/packages/utils/generateRandomString'

type TraceId = string
type TraceParentId = string
type TraceParent = `00-${TraceId}-${TraceParentId}-00`
export const TRACEPARENT_HEADER_NAME = 'traceparent' as const
type TRACEPARENT_HEADER_NAME = typeof TRACEPARENT_HEADER_NAME
export type TraceableFetchEvent = {
  traceSpan: TraceSpan
} & FetchEvent

export class TraceSpan {
  traceId: string
  spanId: string
  parentId?: string
  readonly startTime: number

  constructor(traceId: string, spanId: string, parentId?: string) {
    this.traceId = traceId
    this.spanId = spanId
    if (parentId) this.parentId = parentId
    this.startTime = Date.now()
  }

  /** Gets current duration of span since creation */
  get currendDuration() {
    return Date.now() - this.startTime
  }

  toString() {
    const parentSegment = this.parentId ? `-${this.parentId}` : ''
    return JSON.stringify({
      tracespan: `${this.traceId}${parentSegment}-${this.spanId}${parentSegment}`,
      duration: this.currendDuration,
    })
  }

  getTraceParent() {
    return getTraceParentForSpan(this)
  }
}

/** Generates a span from parsing the `traceparent` trace context header, if available
 * and valid. Otherwise, generates a new trace in the returned span. */
export const generateTraceSpan = (
  headers?: Record<string, string> | Headers
): TraceSpan => {
  let result: TraceSpan

  if (headers) {
    let traceparent
    if (headers instanceof Headers)
      traceparent = headers.get(TRACEPARENT_HEADER_NAME)
    else traceparent = headers[TRACEPARENT_HEADER_NAME]

    if (traceparent) result = createTraceSpan(traceparent as TraceParent)
  }
  //If result hasn't been set (due to missing traceparent in header), create new trace
  if (!result!) result = createTraceSpan()
  return result
}

/** Creates a trace context `traceparent` header record to be included in
 * outbound requests */
export const generateTraceContextHeaders = (
  currentSpan: TraceSpan
): Record<TRACEPARENT_HEADER_NAME, string> => {
  return { [TRACEPARENT_HEADER_NAME]: getTraceParentForSpan(currentSpan) }
}

const getTraceParentForSpan = (span: TraceSpan): TraceParent => {
  //Current span becomes parent for the trace context
  const result: TraceParent = `00-${span.traceId}-${span.spanId}-00`
  return result
}

const createTraceSpan = (traceparent?: TraceParent): TraceSpan => {
  const newSpanId = generateRandomString(16)

  let result: TraceSpan
  if (traceparent) {
    const parsedTraceparent = traceparent.split('-')
    console.assert(
      parsedTraceparent.length === 4,
      `traceparent value: ${traceparent}`
    )
    const [_, traceId, parentId] = parsedTraceparent
    if (traceId && parentId)
      result = new TraceSpan(traceId, newSpanId, parentId)
  }

  //If there was no traceparent or the values weren't valid, we create a new one
  //with no parentId
  if (!result!) {
    result = new TraceSpan(generateRandomString(32), newSpanId)
  }
  return result
}
