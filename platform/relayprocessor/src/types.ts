export interface Environment {
  SECRET_RELAY_DISTRIBUTION_MAP: { [addressEnvSuffix: string]: string }
  INTERNAL_RELAY_DISTRIBUTION_KEY: string
  Core: Fetcher
  INTERNAL_RELAY_DKIM_DOMAIN: string
  INTERNAL_RELAY_DKIM_SELECTOR: string
  SECRET_RELAY_DKIM_PRIVATE_KEY: string
}

/** CF EmailMessage type; not provided in CF types lib */
export interface CloudflareEmailMessage<Body = unknown> {
  readonly from: string
  readonly to: string
  readonly headers: Headers
  readonly raw: ReadableStream
  readonly rawSize: number

  setReject(reason: String): void
  forward(rcptTo: string, headers?: Headers): Promise<void>
}
