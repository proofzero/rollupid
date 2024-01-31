import checkEnv from './checkEnv'
import isFromCFBinding from './isFromCFBinding'
import gatewayFromIpfs from './gateway-from-ipfs'
import getAuthzHeaderConditionallyFromToken from './getAuthzHeaderConditionallyFromToken'
import getAuthzTokenFromReq from './getAuthzTokenFromReq'
import { parseJwt } from './jwt'
import getDNSRecordValue from './getDNSRecordValue'
import { obfuscateAlias } from './text'

export {
  checkEnv,
  isFromCFBinding,
  gatewayFromIpfs,
  getAuthzHeaderConditionallyFromToken,
  getAuthzTokenFromReq,
  parseJwt,
  getDNSRecordValue,
  obfuscateAlias,
}
