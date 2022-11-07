import { BigNumber } from '@ethersproject/bignumber'
import { hexDataSlice } from '@ethersproject/bytes'
import { Formatter } from '@ethersproject/providers'
import { toUtf8String } from '@ethersproject/strings'

import { Methods } from '@open-rpc/meta-schema'

import Core from '../../core'
import JSONRPC, { MethodMap, RPCContext } from '../../jsonrpc'
import Relay from '../relay'

import methodObjects from './methods'
import { LookupAddressParams, LookupAddressResult } from './types'

export default class EthereumNameService extends JSONRPC {
  alchemy: Relay
  formatter: Formatter

  constructor(core: Core) {
    super(core)
    this.alchemy = new Relay(core, {
      url: process.env.ALCHEMY_API_URL,
    })
    this.formatter = new Formatter()
  }

  getMethodMap(): MethodMap {
    return super.getMethodMap({
      ens_lookupAddress: 'lookupAddress',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async lookupAddress(
    params: LookupAddressParams,
    context: RPCContext
  ): Promise<LookupAddressResult> {
    await this.authorize(context)
    const [address] = params
    const { eth: known }: { eth: string[] } = await this.core.storage.get(
      'core/addressMap'
    )
    if ((known || []).indexOf(address) == -1) {
      this.error(null, 'cannot lookup unknown address')
    }

    const reverseAddress = this.getReverseAddress(address)
    const resolverAddress = await this.getResolverAddress(reverseAddress)

    if (!resolverAddress) {
      this.error(null, 'cannot resolve the reverse address')
    }

    const { namehash } = require('@ethersproject/hash')
    const result = await this.alchemy.call(
      'eth_call',
      [
        {
          to: resolverAddress,
          data: '0x691f3431' + namehash(reverseAddress).substring(2),
        },
      ],
      context
    )

    const name = this.readHexDataAsString(result)
    if (name === '0x0000000000000000000000000000000000000000') {
      this.error(null, 'no name found')
    }

    return name
  }

  getReverseAddress(address: string): string {
    return (
      this.formatter.address(address).substring(2).toLowerCase() +
      '.addr.reverse'
    )
  }

  async getResolverAddress(name: string): Promise<string> {
    const { namehash } = require('@ethersproject/hash')
    const address = await this.alchemy.call(
      'eth_call',
      [
        {
          to: process.env.ENS_CONTRACT_ADDRESS,
          data: '0x0178b8bf' + namehash(name).substring(2),
        },
      ],
      {} as RPCContext
    )
    return this.formatter.callAddress(address)
  }

  readHexDataAsString(data: string): string {
    const offset = BigNumber.from(hexDataSlice(data, 0, 32)).toNumber()
    const length = BigNumber.from(
      hexDataSlice(data, offset, offset + 32)
    ).toNumber()
    const value = hexDataSlice(data, offset + 32, offset + 32 + length)
    return toUtf8String(value)
  }
}
