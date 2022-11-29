export interface IENSUtils {
  getENSAddress(address: string): Promise<string>
}

class ENSIdeasUtils implements IENSUtils {
  async getENSAddress(address: string): Promise<string> {
    const ensRes = await fetch(
      `https://api.ensideas.com/ens/resolve/${address}`
    )

    const res: {
      displayName: string | null
      error?: string
    } = await ensRes.json()

    if (res.error) {
      console.error(`Error requesting ens from address: ${res.error}`)

      throw new Error(res.error)
    }

    // This is either the ENS address or
    // actual address if no ENS found
    return res.displayName ?? address
  }
}

export default ENSIdeasUtils
