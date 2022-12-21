export interface IImageUploadClient {
  getImageUploadUrl(): Promise<string>
}

type CfImageUploadUrlRes = {
  id: string
  uploadURL: string
}

class CFImageUploadClient implements IImageUploadClient {
  #imagesFetcher

  constructor(imagesFetcher: Fetcher) {
    this.#imagesFetcher = imagesFetcher
  }

  async getImageUploadUrl(): Promise<string> {
    const res = await this.#imagesFetcher.fetch('http://127.0.0.1/upload')

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
