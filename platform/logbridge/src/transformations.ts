import {
  WorkerTraceEvent,
  LokiStreamLabels,
  LokiStreamValue,
  LokiRequestPayload,
  WorkerLogEntry,
  WorkerExceptionEntry,
} from './types'

export async function getLogpushEntriesFromRequest(
  request: Request
): Promise<WorkerTraceEvent[]> {
  //Assumed gzip compressed data
  const buf = await request.arrayBuffer()
  const enc = new TextDecoder('utf-8')
  const blob = new Blob([buf])
  const ds = new DecompressionStream('gzip')
  const decompressedStream = blob.stream().pipeThrough(ds)
  const buffer = await new Response(decompressedStream).arrayBuffer()
  const decompressed = new Uint8Array(buffer)
  const ndjson = enc.decode(decompressed)

  //Entries are newline-delimiter separated; we convert them to JSON
  const logpushEntryStrings = ndjson.split('\n')
  let jsonLogpushEntries = logpushEntryStrings
    .filter((e) => e !== '')
    .map((e) => JSON.parse(e))

  if (
    jsonLogpushEntries &&
    jsonLogpushEntries.length === 1 &&
    //CF Logpush initial "handshake" log entry
    jsonLogpushEntries[0]['content'] &&
    jsonLogpushEntries[0]['content'] === 'test'
  )
    return []
  else {
    //Filter out entries without log/exception messages, like static asset fetches
    jsonLogpushEntries = (jsonLogpushEntries as WorkerTraceEvent[]).filter(
      (e) => e.Logs.length || e.Exceptions.length
    )
  }
  return jsonLogpushEntries
}

function getEnvironmentFromWorkerName(workerName: string): string | null {
  const result = null
  const nameSegments = workerName.split('-')
  if (nameSegments.length === 2) {
    const envName = nameSegments[1]
    if (['dev', 'next', 'current'].includes(envName)) return envName
  }
  return result
}

function extractTraceFromMessageArray(
  messages: string[]
): Record<string, string> | undefined {
  for (const [index, message] of messages.entries()) {
    if (message.startsWith('{')) {
      try {
        const unescapedTraceString = message.replaceAll('\\"', '"')
        const traceInfo = JSON.parse(unescapedTraceString)
        if (traceInfo['traceparent'] || traceInfo['tracespan']) {
          //If it's a trace segment of a log line, remove it from the
          //message segments array and return it as JSON
          messages.splice(index, 1)
          return traceInfo
        }
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

export function createLokiStreamLabels(
  wte: WorkerTraceEvent
): LokiStreamLabels {
  let result: LokiStreamLabels = { worker: wte.ScriptName }
  const envName = getEnvironmentFromWorkerName(wte.ScriptName)
  if (envName) result = { ...result, env: envName }
  return result
}

export function createLokiStreamValues(
  wte: WorkerTraceEvent
): LokiStreamValue[] {
  const result: LokiStreamValue[] = []

  //Merge and sort regular logs and exception logs by timestamp
  let allLogs: (WorkerLogEntry | WorkerExceptionEntry)[] = wte.Logs
  allLogs = allLogs.concat(wte.Exceptions)

  const allTimeSortedLogs = allLogs.sort(
    (a, b) => a.TimestampMs - b.TimestampMs
  )

  for (const [index, logEntry] of allTimeSortedLogs.entries()) {
    //Arguments passed to console.log() or console.debug() are captured in
    //reverse order in CF logging, hence the need to reverse here
    let lokiMessage: Record<
      string,
      string | Record<string, string> | undefined
    > = {}
    if (logEntry.Message instanceof Array) {
      const workerLogEntry = logEntry as WorkerLogEntry
      const traceRecord = extractTraceFromMessageArray(workerLogEntry.Message)
      const messageFromLogArgs = workerLogEntry.Message.reverse().join(' ')
      lokiMessage = {
        worker: wte.ScriptName,
        message: messageFromLogArgs,
        level: workerLogEntry.Level,
        requestUrl: wte.Event.Request.URL,
        trace: traceRecord,
      }
    } else {
      const exceptionLogEntry = logEntry as WorkerExceptionEntry
      lokiMessage = {
        worker: wte.ScriptName,
        message: exceptionLogEntry.Message,
        level: 'exception',
        exceptionName: exceptionLogEntry.Name,
        requestUrl: wte.Event.Request.URL,
        trace: '',
      }
    }

    //Add a return status code to the last message created for a request
    //This will typically be the message closest to the response being sent
    if (index === allTimeSortedLogs.length - 1) {
      lokiMessage = { ...lokiMessage, statusCode: wte.Event.Response.Status }
    }
    const streamValue: LokiStreamValue = [
      (logEntry.TimestampMs * 1000000).toString(),
      JSON.stringify(lokiMessage),
    ]
    result.push(streamValue)
  }
  return result
}

export function convertLogpushEntriesToLokiStreams(
  logpushEntries: WorkerTraceEvent[]
) {
  const lokiPayload: LokiRequestPayload = { streams: [] }
  logpushEntries.forEach((logpushEntry) => {
    const currentStream = {
      stream: createLokiStreamLabels(logpushEntry),
      values: createLokiStreamValues(logpushEntry),
    }

    lokiPayload.streams.push(currentStream)
  })
  return lokiPayload
}
