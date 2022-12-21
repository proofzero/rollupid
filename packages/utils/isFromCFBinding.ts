export default (request: Request): boolean => {
  const connectingIP = request.headers.get('cf-connecting-ip')

  const allowedOrigin = '127.0.0.1'

  return !connectingIP || connectingIP === allowedOrigin
}
