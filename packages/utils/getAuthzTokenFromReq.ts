export default function (request: Request): string | undefined {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return undefined

  //This should be in the format "Bearer (token)"
  const authorization = authHeader.split(' ')
  if (authorization.length !== 2 || authorization[0] !== 'Bearer')
    throw new Error('Invalid value provided in Authorization header')

  return authorization[1] //token
}
