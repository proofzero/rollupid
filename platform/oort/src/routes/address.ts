import { Request, Router } from 'itty-router'

const router = Router({ base: '/address' })
router.get(
  '/:address',
  (request: Request, env: Environment): Promise<Response> => {
    const { Address } = env
    const { address } = request.params
    const addressCore = Address.get(Address.idFromName(address))
    return addressCore.fetch(`http://localhost/eth/${address}`)
  }
)

export default router.handle
