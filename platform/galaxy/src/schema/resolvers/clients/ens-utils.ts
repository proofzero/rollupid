export interface IENSUtils {
  getENSAddress(address: string): Promise<string | null>
  getENSAddressAvatar(address: string): Promise<string | null>
}

type ENSRes = {
  avatar: string | null
  displayName: string | null
  error?: string
}

class ENSUtils implements IENSUtils {
  private async getEnsEntry(address: string): Promise<ENSRes> {
    const ensRes = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`
    )

    const res: ENSRes = await ensRes.json()

    if (res.error) {
      console.error(`Error requesting ens from address: ${res.error}`)

      throw new Error(res.error)
    }

    return res
  }

  async getENSAddress(address: string): Promise<string | null> {
    const { displayName } = await this.getEnsEntry(address)

    return displayName
  }

  async getENSAddressAvatar(address: string): Promise<string | null> {
    const { avatar } = await this.getEnsEntry(address)

    return avatar
  }
}

export default ENSUtils
