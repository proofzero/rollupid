export interface IImageUploadClient {
  getImageUploadUrl(): Promise<string>
}

type CfImageUploadUrlRes = {
  id: string
  uploadURL: string
}

class CFImageUploadClient implements IImageUploadClient {
  #iconsFetcher

  constructor(iconsFetcher: Fetcher) {
    this.#iconsFetcher = iconsFetcher
  }

  async getImageUploadUrl(): Promise<string> {
    const res = await this.#iconsFetcher.fetch('http://127.0.0.1/')

    try {
      const { uploadURL } = (await res.clone().json()) as CfImageUploadUrlRes

      return uploadURL
    } catch (ex) {
      const errorRes = await res.clone().text()

      console.error(errorRes)

      throw ex
    }
  }
}

export default CFImageUploadClient
