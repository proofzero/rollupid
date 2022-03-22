import {ClientConfig, SanityDocument} from '@sanity/client'

export interface IDocumentPart {
  _type: string
  _id?: string | null | undefined
  name?: string | null | undefined
}

export interface IReferenceDocumentPart extends IDocumentPart {
  _ref: string
}

export interface IFileDocumentPart extends IDocumentPart {
  asset: {
    _ref: string
    _type: string
  }
}

export interface ISanityServiceSanityClient {
  getDocument<R = any>(id: string, options?: {tag?: string}): Promise<SanityDocument<R> | undefined>
  config(): ClientConfig
}

export interface ISanityService {
  /**
   * Initializes the internal sanity client. This is asynchronously initialized
   * because the dependency on the :parts system should be extracted in order to
   * create a properly testable module
   */
  init(sanityClient: ISanityServiceSanityClient)

  /**
   *
   * @param documentPart A draft or published Sanity Document or a sub object of said document
   * @param deep Controls whether the function goes as deep as possible in expanding or stops at the first layer
   * @returns A representation of documentPart with expanded references, files and images
   */
  expandObjectAsync(
    documentPart: any,
    counter?: IDocumentStructureCounter,
    deep?: boolean
  ): Promise<any>

  /**
   * Returns true if the sanity client has been injected elsewhere.
   * Returns false if it has not and exceptions are expected
   */
  get IsInit(): boolean

  /**
   * Returns the configuration object for the currently running
   * Sanity instance
   */
  get Config(): ClientConfig
}

export interface IDocumentStructureCounter {
  primitives: number
  arrays: number
  objects: number
  references: number
  files: number
}

export class SanityService implements ISanityService {
  private _sanityClient: ISanityServiceSanityClient | null

  /**
   * Contains all different document type handlers.
   * Add new ones here as Sanity adds new object types or we learn to handle additional ones.
   */
  private readonly documentPartHandlerDict: {
    [key: string]: (
      documentPart: IDocumentPart,
      deep: boolean,
      counter: IDocumentStructureCounter
    ) => Promise<any>
  } = {
    image: this.handleFile.bind(this),
    file: this.handleFile.bind(this),
  }

  public init = (sanityClient: ISanityServiceSanityClient) => {
    this._sanityClient = sanityClient
  }

  public get IsInit(): boolean {
    return this._sanityClient && this._sanityClient.config() !== null
  }

  public get Config(): ClientConfig {
    return this._sanityClient.config()
  }

  public expandObjectAsync = async (
    documentPart: any,
    counter: IDocumentStructureCounter = null,
    deep = false,
    endpoint: {valid: boolean} = null
  ): Promise<any> => {
    // Handle null and empty object case
    if (
      documentPart === null ||
      (Object.keys(documentPart).length === 0 &&
        Object.getPrototypeOf(documentPart) === Object.prototype)
    ) {
      return null
    }

    // Handle case where documentPart is an array of other objects
    if (Array.isArray(documentPart)) {
      return this.handleArray(documentPart, deep, counter)
    }

    if (this.documentPartHandlerDict[documentPart._type]) {
      if (endpoint) {
        endpoint.valid = true
      }

      return this.documentPartHandlerDict[documentPart._type](
        documentPart as IDocumentPart,
        deep,
        counter
      )
    }

    if (documentPart._type === 'reference') {
      if (counter) counter.references++

      if (deep) {
        return this.handleReference(documentPart as IReferenceDocumentPart, counter)
      }
    }

    // Just map primitives, no need to further process them
    const primitives = Object.keys(documentPart)
      .filter((key) => documentPart[key] !== Object(documentPart[key]))
      .reduce(
        (destructuredObject, key) => ({
          ...destructuredObject,
          [key]: documentPart[key],
        }),
        {}
      )

    // Map all sub-objects in the documentPart, recursively expanding them and mapping them
    // to a new object's keys. After resolving asynchronous methods, similar to the primitive approach
    const objects = (
      await Promise.all(
        Object.keys(documentPart)
          .filter((key) => documentPart[key] === Object(documentPart[key]))
          .map(async (key) => ({
            key,
            object: await this.expandObjectAsync(documentPart[key], counter, deep, endpoint),
          }))
      )
    ).reduce(
      (destructuredObject, kv) => ({
        ...destructuredObject,
        [kv.key]: kv.object,
      }),
      {}
    )

    if (counter) {
      counter.primitives += Object.keys(primitives).length
      counter.objects += Object.keys(objects).length
    }

    if (endpoint) endpoint.valid = true

    return {
      ...primitives,
      ...objects,
    }
  }

  /**
   * Hooks into the main studio project & dataset, returning a document that matches the unique identifier provided.
   * @param id Sanity ID of the document to be returned
   * @returns Sanity document
   */
  private getDocument = async (id: string): Promise<IDocumentPart> => {
    if (!this._sanityClient) {
      throw new Error()
    }

    return this._sanityClient.getDocument(id)
  }

  /**
   * Recursively expands all references encountered on trunk by
   * calling the Sanity API and filling in missing details
   * @param referenceObject Sanity object containing an _id key
   *
   * @returns Resoolve known objects in array, recursively expanding them
   */
  private handleReference = async (
    referenceObject: IReferenceDocumentPart,
    counter: IDocumentStructureCounter
  ): Promise<any> => {
    if (counter) counter.references++

    return {
      ...referenceObject,
      ...(await this.expandObjectAsync(
        await this.getDocument(referenceObject._ref),
        counter,
        true
      )),
    }
  }

  /**
   * Fetches file from Sanity content lake and fills in the asset data.
   * This method preserves the original structure of a parent with an asset suobject
   * @param fileObject anity object containing required reference _id
   * @returns Resolved encountered file expanded with all parameters
   */
  private async handleFile(
    fileObject: IFileDocumentPart,
    deep: boolean,
    counter: IDocumentStructureCounter
  ) {
    if (counter) counter.files++

    const document = await this.getDocument(fileObject.asset._ref)
    const destructuredDocument = await this.expandObjectAsync(document, counter, deep)

    return {
      ...fileObject,
      asset: {
        ...fileObject.asset,
        ...destructuredDocument,
      },
    }
  }

  /**
   * Expand all objects in array
   * @param array An array ideally of sanity document parts or objects covered in handlers
   * @returns An array of the expanded objects
   */
  private async handleArray(array: any[], deep: boolean, counter: IDocumentStructureCounter) {
    const endpoint = {valid: false}

    if (array.length > 0 && counter) {
      counter.arrays++
    }

    const expandedArray = await Promise.all(
      array.map(async (ae) => this.expandObjectAsync(ae, counter, deep, endpoint))
    )
    if (!endpoint.valid) return null

    return expandedArray
  }
}

const sanityService = new SanityService()

export default sanityService
