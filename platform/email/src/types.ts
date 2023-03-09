export interface Environment {
  DefaultEmailFromName: string
  DefaultEmailFromUser: string
  KEY_DKIM_PRIVATEKEY: string
  INTERNAL_DKIM_SELECTOR: string
  INTERNAL_DKIM_DOMAIN: string
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

export type EmailContentType = 'text/plain' | 'text/html'
export type EmailAddressComponents = {
  name: string
  address: string
}

export type EmailMessage = {
  from: EmailAddressComponents
  recipient: EmailAddressComponents
  content: EmailContent
}

export type EmailNotification = Omit<EmailMessage, 'from'>

export type EmailContent = {
  contentType: EmailContentType
  subject: string
  body: string
}
