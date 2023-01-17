import { DOProxy, DurableObjectStubProxy } from 'do-proxy'

export default class ContractAddress extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }
}
export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
