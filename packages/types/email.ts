export enum ReconciliationNotificationType {
  Billing = 'BILLING',
  Dev = 'DEV',
}

/** CF EmailMessage type; not provided in CF types lib */
export interface CloudflareEmailMessage {
  readonly from: string
  readonly to: string
  readonly headers: Headers
  readonly raw: ReadableStream
  readonly rawSize: number

  setReject(reason: string): void
  forward(rcptTo: string, headers?: Headers): Promise<void>
}
