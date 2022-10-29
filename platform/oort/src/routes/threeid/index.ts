import { Router } from 'itty-router'
import invite from './invite'

const router = Router()
router.all('/invite/*', invite.handle)

export default router.handle
