export interface IENSUtils {
  getENSDisplayName(addressOrEns: string): Promise<string | null>
  getENSAddress(addressOrEns: string): Promise<string>
  getENSAddressAvatar(addressOrEns: string): Promise<string | null>
}

export type ENSRes = {
  address: string
  avatar: string | null
  displayName: string | null
  error?: string
}

class ENSUtils implements IENSUtils {
  async getEnsEntry(address: string): Promise<ENSRes> {
    const ensRes = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`,
      {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,
          cacheKey: address,
        },
      }
    )

    const res: ENSRes = await ensRes.json()

    if (res.error) {
      console.error(`Error requesting ens from address: ${res.error}`)

      throw new Error(res.error)
    }

    return res
  }

  async getENSDisplayName(addressOrEns: string): Promise<string | null> {
    const { displayName } = await this.getEnsEntry(addressOrEns)

    return displayName
  }

  async getENSAddress(addressOrEns: string): Promise<string> {
    const { address } = await this.getEnsEntry(addressOrEns)

    return address
  }

  async getENSAddressAvatar(addressOrEns: string): Promise<string | null> {
    const { avatar } = await this.getEnsEntry(addressOrEns)

    return avatar
  }
}

export default ENSUtils
