import _ from 'lodash'
import { Request, Router } from 'itty-router'
import { error, status } from 'itty-router-extras'
import { hexlify } from '@ethersproject/bytes'
import { Methods } from '@open-rpc/meta-schema'
import Core, { AddressMap } from '../../core'
import { Context } from '../../types'
import JSONRPC, { MethodMap, RPCContext } from '../../jsonrpc'
import { CoreRequest } from '../../routes/core/types'
import { getNFTs, getOwnersForToken } from '../../utils/nft'
import Relay from '../relay'

import methodObjects from './methods'

import {
  GetInviteCodeParams,
  GetInviteCodeResult,
  InviteCode,
  InviteCodeConfig,
  ListInvitationsParams,
  ListInvitationsResult,
  RedeemInvitationParams,
  RedeemInvitationResult,
  RegisterNameParams,
  RegisterNameResult,
  UnregisterNameParams,
  UnregisterNameResult,
} from './types'

export default class ThreeID extends JSONRPC {
  alchemy: Relay

  constructor(core: Core) {
    super(core)
    this.registerRouter()
    this.alchemy = new Relay(core, {
      url: process.env.ALCHEMY_API_URL,
    })
  }

  registerRouter() {
    const submitHandler = async (request: Request) => {
      const { code } = request.params || {}
      const { coreContext: context } = request as CoreRequest
      const { address, hash } = await request.json()
      return this.confirmInviteCodeTransaction(
        code,
        address,
        hash,
        context as RPCContext
      )
    }

    const invite = Router({ base: '/invite' })
      .post('/submit/:code', submitHandler)
      .post('/submit/', submitHandler)

    this.core.router.all('/invite/*', invite.handle)
  }

  getMethodMap(): MethodMap {
    return super.getMethodMap({
      '3id_getInviteCode': 'getInviteCode',
      '3id_listInvitations': 'listInvitations',
      '3id_redeemInvitation': 'redeemInvitation',
      '3id_getNFTs': 'getNFTs',
      '3id_registerName': 'registerName',
      '3id_unregisterName': 'unregisterName',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async getInviteCode(
    params: GetInviteCodeParams,
    context: Context
  ): Promise<GetInviteCodeResult> {
    await this.authorize(context, '3id.enter')
    const { storage } = this.core
    const { THREEID, THREEID_INVITE_CODES } = this.core.env

    let invite: InviteCode = await storage.get('3id.invite_code')
    if (!invite) {
      const config: InviteCodeConfig = await THREEID.get('invite_code', 'json')
      const raw = crypto.getRandomValues(new Uint8Array(config.length))
      const code = hexlify(raw).substring(2)
      const holders = []
      invite = { code, holders }
      await storage.put('3id.invite_code', invite)
      THREEID_INVITE_CODES.put(code, this.core.state.id.toString())
    }

    return invite
  }

  async confirmInviteCodeTransaction(
    code: string | null,
    address: string,
    hash: string,
    context: RPCContext
  ): Promise<Response> {
    const { storage } = this.core
    const { THREEID } = this.core.env

    let invite: InviteCode
    if (code) {
      invite = await storage.get('3id.invite_code')
      if (code != invite.code) {
        return error(400, 'wrong code')
      }
    }

    const receipt = await this.alchemy.call(
      'eth_getTransactionReceipt',
      [hash],
      context
    )

    const config = await THREEID.get<InviteCodeConfig>('invite_code', 'json')
    if (receipt.to != config.contract_address.toLowerCase()) {
      return error(400, 'tx to invalid address')
    }

    if (receipt.status != '0x1') {
      return error(400, 'tx status not success')
    }

    if (invite) {
      invite.holders.push({ address, timestamp: Date.now() })
      await storage.put('3id.invite_code', invite)
    }

    return status(200)
  }

  async listInvitations(
    params: ListInvitationsParams,
    context: Context
  ): Promise<ListInvitationsResult> {
    await this.authorize(context)

    if (!context.core.env.THREEID) {
      this.error(null, 'missing 3id')
    }

    const addressMap: AddressMap = await this.core.storage.get(
      'core/addressMap'
    )

    if (!addressMap.eth.length) {
      this.error(null, 'missing eth address')
    }

    // TODO: this is a hack, we should be able to get the eth address from the context
    // this is okay for now because this is only caleld during first login
    // this entire method should be migrated to BFF and deprecated
    const owner = addressMap.eth[0]

    const contractAddresses = await context.core.env.THREEID.get<string[]>(
      'invite_contract_addresses',
      'json'
    )

    if (!contractAddresses || contractAddresses.length == 0) {
      this.error(null, 'missing contract addresses')
    }

    const response = await getNFTs({ owner, contractAddresses })

    return response['ownedNfts'].map((nft) => ({
      contractAddress: nft.contract.address,
      tokenId: nft.id.tokenId,
      title: nft.title,
      image: nft.metadata.image,
    }))
  }

  async redeemInvitation(
    params: RedeemInvitationParams,
    context: Context
  ): Promise<RedeemInvitationResult> {
    await this.authorize(context)

    if (!context.core.env.THREEID) {
      this.error(null, 'missing 3id')
    }

    const contractAddresses = await context.core.env.THREEID.get<string[]>(
      'invite_contract_addresses',
      'json'
    )

    if (!contractAddresses || contractAddresses.length == 0) {
      this.error(null, 'missing contract addresses')
    }

    const [contractAddress, tokenId] = params

    if (
      contractAddresses
        .map((a) => a.toLowerCase())
        .includes(contractAddress.toLowerCase())
    ) {
      const { owners } = await getOwnersForToken({ contractAddress, tokenId })
      const knownAddresses = await this.core.getAddresses(['eth'])
      const ethAddresses = knownAddresses['eth'].map((a) => a.toLowerCase())

      if (_.intersection(owners, ethAddresses).length) {
        const subject = context.claims.sub
        await this.core.grantClaims(subject, ['3id.enter'])
        return true
      }
    }

    return false
  }

  async getNFTs(params, context) {
    await this.authorize(context, '3id.enter')
    return getNFTs(params)
  }

  async registerName(
    params: RegisterNameParams,
    context: RPCContext
  ): Promise<RegisterNameResult> {
    await this.authorize(context, '3id.enter')
    const [address] = params
    const name = await context.packages.ens.lookupAddress(params, context)

    const { Address } = this.core.env
    const nameAddress = Address.get(Address.idFromName(name))

    const method = 'POST'
    const body = JSON.stringify({
      type: 'ens',
      name,
      address,
      coreId: this.core.state.id.toString(),
    })
    await nameAddress.fetch('http://localhost', { method, body })
  }

  async unregisterName(
    params: UnregisterNameParams,
    context: RPCContext
  ): Promise<UnregisterNameResult> {
    await this.authorize(context, '3id.enter')
    const [address] = params
    const name = await context.packages.ens.lookupAddress(params, context)
    const { Address } = this.core.env
    const nameAddress = Address.get(Address.idFromName(name))
    await nameAddress.fetch('http://localhost', {
      method: 'DELETE',
      body: JSON.stringify({ type: 'ens', address }),
    })
  }
}
