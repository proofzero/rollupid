export interface IENSUtils {
  getENSAddress(address: string): Promise<string | null>
  getENSAddressAvatar(address: string): Promise<string | null>
}

type ENSIdeasRes = {
  avatar: string | null
  displayName: string | null
  error?: string
}

class ENSIdeasUtils implements IENSUtils {
  private async getEnsEntry(address: string): Promise<ENSIdeasRes> {
    const ensRes = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`
    )

    const res: ENSIdeasRes = await ensRes.json()

    console.log(res)

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

export default ENSIdeasUtils
