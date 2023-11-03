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
  async getEnsEntry(address: string): Promise<ENSRes | undefined> {
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

    if (ensRes.status === 200) return ensRes.json<ENSRes>()

    console.error(`ENSIdeasError: ${await ensRes.text()}`)
  }

  async getENSDisplayName(addressOrEns: string): Promise<string> {
    const profile = await this.getEnsEntry(addressOrEns)
    return profile?.displayName || ''
  }

  async getENSAddress(addressOrEns: string): Promise<string> {
    const profile = await this.getEnsEntry(addressOrEns)
    return profile?.address || ''
  }

  async getENSAddressAvatar(addressOrEns: string): Promise<string> {
    const profile = await this.getEnsEntry(addressOrEns)
    return profile?.avatar || ''
  }
}

export default ENSUtils
