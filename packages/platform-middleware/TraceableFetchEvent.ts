import { TraceSpan } from './trace'

export class TraceableFetchEvent extends FetchEvent {
  traceSpan: TraceSpan
  constructor(type: string, eventInitDict: EventInit, traceSpan: TraceSpan) {
    super(type, eventInitDict)
    this.traceSpan = traceSpan
  }
}
