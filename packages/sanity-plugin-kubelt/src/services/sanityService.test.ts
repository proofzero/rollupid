import {ISanityServiceSanityClient, SanityService, ISanityService} from './sanityService'

const pdfDocument = {
  _type: 'file',
  asset: {
    _ref: 'pdfFile',
    _type: 'reference',
  },
}

const imgDocument = {
  _type: 'image',
  asset: {
    _ref: 'imgFile',
    _type: 'reference',
  },
}

const refDocument = {
  person: {
    _type: 'reference',
    _ref: 'person_matthew-mcconaughey',
  },
}

const documentDict = {
  pdfFile: {
    mimeType: 'application/pdf',
    url: 'https://cdn.sanity.io/files/bf14pkaa/kubeltdb/54acc0e33fbdf23ffe12f7a076e3725af19463ba.pdf',
    _id: 'pdfFile',
    _type: 'sanity.fileAsset',
  },
  imgFile: {
    mimeType: 'image/jpeg',
    url: 'https://cdn.sanity.io/images/bf14pkaa/kubeltdb/7a3d45284a9c8a8c47706031420395cc17f6a0ea-2048x1152.jpg',
    _id: 'imgFile',
    _type: 'sanity.imageAsset',
  },
  'person_matthew-mcconaughey': {
    _type: 'person',
    _id: 'person_matthew-mcconaughey',
    name: 'Matthew McConaughey',
  },
}

const sanityService: ISanityService = new SanityService()
const mockSanityClient: ISanityServiceSanityClient = {
  config: jest.fn(() => ({
    projectId: 'Foo',
    dataset: 'Bar',
  })),
  getDocument: jest.fn((id) => documentDict[id]),
}

describe('Uninitialized service responds properly', () => {
  test('IsInit responds negatively when uninitialized', () => {
    expect(sanityService.IsInit).toBeFalsy()
  })
})

describe('Initialized service responds properly', () => {
  beforeAll(() => {
    sanityService.init(mockSanityClient)
  })

  test('IsInit responds positively when initialized', () => {
    expect(sanityService.IsInit).toBeTruthy()
    expect(mockSanityClient.config).toBeCalled()
  })

  test('Nulls return null', async () => {
    const emptyObj = null
    const expandedObj = await sanityService.expandObjectAsync(emptyObj)

    expect(expandedObj).toBeNull()
  })

  test('Empty objects return null', async () => {
    const emptyObj = {}
    const expandedObj = await sanityService.expandObjectAsync(emptyObj)

    expect(expandedObj).toBeNull()
  })

  test('Empty array returns null', async () => {
    const emptyArray = []
    const expandedObj = await sanityService.expandObjectAsync(emptyArray)

    expect(expandedObj).toBeNull()
  })

  test('Empty nested array returns null', async () => {
    const nestedArrays = [[[]]]
    const expandedObj = await sanityService.expandObjectAsync(nestedArrays)

    expect(expandedObj).toBeNull()
  })

  test('Objects without _type return as is', async () => {
    const obj = {
      foo: 'bar',
      biz: 'baz',
    }
    const expandedObj = await sanityService.expandObjectAsync(obj)

    expect(expandedObj).toEqual(obj)
  })

  test('Objects with unknown _type return as is', async () => {
    const obj = {
      _type: 'foobar',
      biz: 'baz',
    }
    const expandedObj = await sanityService.expandObjectAsync(obj)

    expect(expandedObj).toEqual(obj)
  })

  test('Objects preserve primitive keys', async () => {
    const obj = {
      _type: 'foobar',
      _id: 'much',
      _ref: 'wow',
      nullObj: null,
      undefObj: undefined,
      emptyArray: [],
      nestedEmptyArray: [[]],
      emptyObj: {},
      foo: 'bar',
      one: 2,
    }

    const expandedObj = await sanityService.expandObjectAsync(obj)

    expect(expandedObj.nullObj).toBeNull()
    expect(expandedObj.undefObj).toBeUndefined()
    expect(expandedObj.emptyArray).toBeNull()
    expect(expandedObj.nestedEmptyArray).toBeNull()
    expect(expandedObj.emptyObj).toBeNull()

    expect(expandedObj._type).toBeDefined()
    expect(expandedObj._id).toBeDefined()
    expect(expandedObj._ref).toBeDefined()
    expect(expandedObj.foo).toBeDefined()
    expect(expandedObj.one).toBeDefined()
  })

  test('Files preserve initial _type and _ref on top of asset _type and _id', async () => {
    const pdfFile = pdfDocument
    const imgFile = imgDocument

    const expandedPdfFile = await sanityService.expandObjectAsync(pdfFile)
    const expandedImgFile = await sanityService.expandObjectAsync(imgFile)

    // Test for preserving initial _type
    expect(expandedPdfFile._type).toEqual(pdfFile._type)
    expect(expandedImgFile._type).toEqual(imgFile._type)

    // Test that asset as a sub-object was preserved
    expect(expandedPdfFile.asset).toBeDefined()
    expect(expandedImgFile.asset).toBeDefined()

    // Test that sub-object _type was preserved
    expect(expandedPdfFile.asset._type).toEqual(documentDict.pdfFile._type)
    expect(expandedImgFile.asset._type).toEqual(documentDict.imgFile._type)

    // Check that _id is indeed generated for documents with _ref
    expect(expandedPdfFile.asset._id).toBeDefined()
    expect(expandedImgFile.asset._id).toBeDefined()

    // Check that the equality between _id and _ref is kept
    expect(expandedPdfFile.asset._id).toEqual(expandedPdfFile.asset._ref)
    expect(expandedImgFile.asset._id).toEqual(expandedImgFile.asset._ref)
  })

  test(`References don't get resolved when deep is disabled`, async () => {
    const refObj = refDocument

    const expandedRefObj = await sanityService.expandObjectAsync(refObj, null, false)

    expect(expandedRefObj.person._type).toBe(refObj.person._type)
  })

  test(`References get resolved when deep is enabled`, async () => {
    const refObj = refDocument

    const expandedRefObj = await sanityService.expandObjectAsync(refObj, null, true)

    expect(expandedRefObj.person._type).not.toBe(refObj.person._type)
  })

  test('Arrays of references get properly resolved when deep is disabled', async () => {
    const refArray = [
      {
        _type: 'castMember',
        person: {
          _ref: 'person_matthew-mcconaughey',
          _type: 'reference',
        },
      },
    ]

    const expandedRefArray = await sanityService.expandObjectAsync(refArray, null, false)

    expect(expandedRefArray).toBeInstanceOf(Array)
    expect(expandedRefArray.length).toBe(1)
    expect(expandedRefArray[0].person._type).toBe(refArray[0].person._type)
  })

  test('Arrays of references get properly resolved when deep is enabled', async () => {
    const refArray = [
      {
        _type: 'castMember',
        person: {
          _ref: 'person_matthew-mcconaughey',
          _type: 'reference',
        },
      },
    ]

    const expandedRefArray = await sanityService.expandObjectAsync(refArray, null, true)

    expect(expandedRefArray).toBeInstanceOf(Array)
    expect(expandedRefArray.length).toBe(1)
    expect(expandedRefArray[0].person._type).not.toBe(refArray[0].person._type)
  })

  test('Objects of references get properly resolved when deep is disabled', async () => {
    const refObj = {
      refObjChild: {
        _type: 'castMember',
        person: {
          _ref: 'person_matthew-mcconaughey',
          _type: 'reference',
        },
      },
    }

    const expandedRefObj = await sanityService.expandObjectAsync(refObj, null, false)

    expect(expandedRefObj).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild.person).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild.person._type).toBe(refObj.refObjChild.person._type)
  })

  test('Objects of references get properly resolved when deep is enabled', async () => {
    const refObj = {
      refObjChild: {
        _type: 'castMember',
        person: {
          _ref: 'person_matthew-mcconaughey',
          _type: 'reference',
        },
      },
    }

    const expandedRefObj = await sanityService.expandObjectAsync(refObj, null, true)

    expect(expandedRefObj).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild.person).toBeInstanceOf(Object)
    expect(expandedRefObj.refObjChild.person._type).not.toBe(refObj.refObjChild.person._type)
  })
})
