#!/usr/bin/env node
//Usage: CLOUDFLARE_ACCOUNT='xxx' CLOUDFLARE_API_KEY='xxx' LOGBRIDGE_URL='xxx' AUTHORIZATION_HEADER_PSK='xxx' ./create-cf-logpush-jobs.js
//Environment variables that need to be set prior to running script
const CLOUDFLARE_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY
const LOGBRIDGE_URL = process.env.LOGBRIDGE_URL
const AUTHORIZATION_HEADER_PSK = process.env.AUTHORIZATION_HEADER_PSK

//Pre-check
if (
  CLOUDFLARE_ACCOUNT &&
  CLOUDFLARE_API_KEY &&
  LOGBRIDGE_URL &&
  AUTHORIZATION_HEADER_PSK
) {
  //Create URL and header
  const AUTHORIZATION_HEADER_KEY = 'X-LOGBRIDGE-PSK'
  const logpushDestinationURL = new URL(LOGBRIDGE_URL)
  logpushDestinationURL.searchParams.append(
    `header_${AUTHORIZATION_HEADER_KEY}`,
    AUTHORIZATION_HEADER_PSK
  )

  const WORKER_LOG_FIELDS =
    'Event,EventTimestampMs,Exceptions,Logs,Outcome,ScriptName'

  const requestPayload = {
    name: 'logbridge',
    logpull_options: `fields=${WORKER_LOG_FIELDS}&timestamps=unix`,
    destination_conf: logpushDestinationURL.toString(),
    max_upload_bytes: 5000000,
    max_upload_records: 1000,
    dataset: 'workers_trace_events',
    frequency: 'high',
    enabled: true,
  }

  const fetchOpts = {
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(requestPayload),
  }

  const fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT}/logpush/jobs`

  fetch(fetchUrl, fetchOpts)
    .then((res) => {
      console.log('Result:', { code: res.status, status: res.statusText })
      return res.text()
    })
    .then((text) => {
      console.log(text)
    })
} else {
  console.error('Required environment variables not set correctly.')
}
