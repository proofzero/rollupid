import { DeploymentMetadata } from '@proofzero/types'

export interface Environment {
  Analytics?: AnalyticsEngineDataset
  ServiceDeploymentMetadata?: DeploymentMetadata

  NotificationFromName: string
  NotificationFromUser: string
  KEY_DKIM_PRIVATEKEY: string
  INTERNAL_DKIM_SELECTOR: string
  INTERNAL_DKIM_DOMAIN: string

  Test: Fetcher | undefined
  SECRET_TEST_API_TEST_TOKEN: string | undefined
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
  customHostname?: string
}

export type EmailNotification = Omit<EmailMessage, 'from'>

export type EmailContent = {
  contentType: EmailContentType
  subject: string
  body: string
}
