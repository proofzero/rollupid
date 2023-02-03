export default function (token: string | undefined): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}
