/**
 * This method was created to work around TRPC encoding issue when passing
 * empty value for the header which would get encoded as "null" string.
 * @param token jwt token if specified
 * @returns Valid optional header input for TRPC
 */

export default function (token: string | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}
