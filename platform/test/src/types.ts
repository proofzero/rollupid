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

export type Environment = {
  SECRET_TEST_API_TOKEN: string
  otp_test: KVNamespace
}
