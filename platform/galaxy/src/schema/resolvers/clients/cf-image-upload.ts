interface IImageUploadClient {
  getImageUploadUrl(): Promise<string>
}

class CFImageUploadClient implements IImageUploadClient {
  getImageUploadUrl(): Promise<string> {
    throw new Error('Method not implemented.')
  }
}

export default CFImageUploadClient
