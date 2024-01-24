export interface Environment {
  SECRET_RELAY_DISTRIBUTION_MAP: { [addressEnvSuffix: string]: string }
  INTERNAL_RELAY_DISTRIBUTION_KEY: string
  Core: Fetcher
  INTERNAL_RELAY_DKIM_DOMAIN: string
  INTERNAL_RELAY_DKIM_SELECTOR: string
  SECRET_RELAY_DKIM_PRIVATE_KEY: string
}
