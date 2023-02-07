export default function (token: string | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}
