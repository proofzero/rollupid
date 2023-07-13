import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'

export const ACCOUNT_OPTIONS = {
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

export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')

//Needed for address operations where the single addressUrn passed during creation isn't the one
//being operated on, as method interfaces have more appropriate addressURN structures for operation
//in question
export const NO_OP_ADDRESS_PLACEHOLDER = AddressURNSpace.componentizedUrn(
  'urn:rollupid/address:z-no-op-address-placeholder',
  { addr_type: EmailAddressType.Email, node_type: NodeType.Email },
  { alias: 'no-op-address-placeholder' }
)
