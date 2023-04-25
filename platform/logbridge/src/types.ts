export type Environment = {
  INTERNAL_LOKI_USER: string
  SECRET_LOKI_API_KEY: string
  INTERNAL_LOKI_URL: string
  SECRET_LOGPUSH_JOB_AUTHZ_KEY: string
}

export type WorkerLogEntry = {
  Level: 'debug' | 'error' | 'log' | 'warn' | 'info'
  Message: string[] //Contains args given to console.log/debug in reverse order
  TimestampMs: number
}

export type WorkerExceptionEntry = {
  Name: string
  Message: string
  TimestampMs: number
}

export type WorkerEventEntry = {
  Request: {
    URL: string
    Method: 'GET' | 'POST' //..others?
  }
  Response: {
    Status: string //HTTP status code
  }
}

export type WorkerTraceEvent = {
  Event: WorkerEventEntry
  EventTimestampMs: number
  EventType: 'fetch'
  Exceptions: WorkerExceptionEntry[]
  Logs: WorkerLogEntry[]
  Outcome: 'ok' | 'cancelled' | 'exception'
  ScriptName: string
}

export type LokiStreamLabels = {
  worker: string
  env?: string
  statusCode?: string
}

export type LokiStreamValue = [unixtime: string, stringifiedJsonMessage: string]

export type LokiStream = {
  stream: LokiStreamLabels
  values: LokiStreamValue[]
}

export type LokiRequestPayload = {
  streams: LokiStream[]
}
