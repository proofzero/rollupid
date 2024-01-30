import { EmailAccountType, NodeType } from '@proofzero/types/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'

export const IDENTITY_OPTIONS = {
  length: 24,
}

export const NONCE_OPTIONS = {
  length: 24,
  ttl: 60000,
}

export const EMAIL_VERIFICATION_OPTIONS = {
  CODE_LENGTH: 6,
  STATE_LENGTH: 12,
}

export const EDGE_ACCOUNT: EdgeURN = EdgeSpace.urn('owns/account')

//Needed for account operations where the single accountUrn passed
//during creation isn't the one being operated on, as method
//interfaces have more appropriate accountURN structures for operation
//in question
export const NO_OP_ACCOUNT_PLACEHOLDER = AccountURNSpace.componentizedUrn(
  'urn:rollupid/account:z-no-op-account-placeholder',
  { addr_type: EmailAccountType.Email, node_type: NodeType.Email },
  { alias: 'no-op-account-placeholder' }
)

export const ZERODEV_SESSION_KEY_TTL = 90 * 24 * 60 * 60 * 10000 // 90 days
