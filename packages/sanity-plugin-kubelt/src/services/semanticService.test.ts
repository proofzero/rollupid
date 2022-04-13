import {
  ISanityServiceSanityClient,
  SanityService,
  ISanityService,
} from "./sanityService";
import SemanticService, { ISemanticService } from "./semanticService";

const sanityService: ISanityService = new SanityService();
const mockSanityClient: ISanityServiceSanityClient = {
  config: jest.fn(() => ({
    projectId: "Foo",
    dataset: "Bar",
  })),
  getDocument: jest.fn((id) => null),
};

sanityService.init(mockSanityClient);

const semanticService = new SemanticService(sanityService);

test("Nulls return null", () => {
  const emptyObj = null;
  const semanticObj = semanticService.semantify(emptyObj);

  expect(semanticObj).toBeNull();
});

test("Empty objects return null", () => {
  const emptyObj = {};
  const semanticObj = semanticService.semantify(emptyObj);

  expect(semanticObj).toBeNull();
});

test("Empty array returns null", () => {
  const emptyArray = [];
  const semanticObj = semanticService.semantify(emptyArray);

  expect(semanticObj).toBeNull();
});

test("Empty nested array returns null", () => {
  const nestedArrays = [[[]]];
  const semanticObj = semanticService.semantify(nestedArrays);

  expect(semanticObj).toBeNull();
});

test("POJO without relevant children gets ignored", () => {
  const obj = {
    foo: "bar",
    biz: "baz",
  };
  const semanticObj = semanticService.semantify(obj);
  expect(semanticObj).toBeNull();
});

test("POJO with empty children gets ignored", () => {
  const obj = {
    foo: "bar",
    biz: "baz",
    children: ["x", "y", "z"],
    child: {
      in: "time",
    },
  };

  const semanticObj = semanticService.semantify(obj);
  expect(semanticObj).toBeNull();
});

test("Objects can self reference", () => {
  const obj = {
    _id: "drafts.5ac05c63-457f-431f-b1ee-0d1e3eac82eb",
    _type: "person",
    name: "Not Zorro",
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
});

test("Objects with important sub-objects become ItemList", () => {
  const obj = {
    importanSubObj1: {
      _id: "foo",
    },
    importanSubObj2: {
      _id: "Bar",
    },
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@context"]).toBeDefined();
  expect(semanticObj["@type"]).toBeDefined();
  expect(semanticObj["@type"]).toBe("ItemList");
});

test(`Objects with local ids should become their own things...`, () => {
  const obj = {
    _id: "foobar",
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj.itemListElement).toBeDefined();
  expect(semanticObj.itemListElement).toBeInstanceOf(Array);
  expect(semanticObj.itemListElement).toHaveLength(1);
});

test("Objects drop primitive keys", () => {
  const obj = {
    _id: "foobar",
    _type: "person",
    name: "Not Zorro",
    slug: {
      _type: "slug",
      current: "not-zorro",
    },
    address: {
      city: "biz",
      street: "fu",
      streetNo: "bar",
    },
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["slug"]).not.toBeDefined();
  expect(semanticObj["address"]).not.toBeDefined();
  expect(semanticObj["@context"]).toBeDefined();
  expect(semanticObj["@type"]).toBeDefined();
  expect(semanticObj["@type"]).toBe("Thing");
});

test("Files generate proper schema.org type and contains useful properties", () => {
  const fileObj = {
    _type: "file",
    asset: {
      _id: "foobar",
      mimeType: "application/pdf",
      url: "https://cdn.sanity.io/files/bf14pkaa/kubeltdb/54acc0e33fbdf23ffe12f7a076e3725af19463ba.pdf",
    },
  };

  const semanticObj = semanticService.semantify(fileObj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@context"]).toBeDefined();
  expect(semanticObj["@type"]).toBe("DigitalDocument");
  expect(semanticObj.url).toBe(fileObj.asset.url);
  expect(semanticObj["encodingFormat"]).toBe(fileObj.asset.mimeType);
});

test("Images generate proper schema.org type and contains useful properties", () => {
  const fileObj = {
    _type: "image",
    asset: {
      _id: "foobar",
      mimeType: "image/jpeg",
      url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/7a3d45284a9c8a8c47706031420395cc17f6a0ea-2048x1152.jpg",
    },
  };

  const semanticObj = semanticService.semantify(fileObj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@context"]).toBeDefined();
  expect(semanticObj["@type"]).toBe("ImageObject");
  expect(semanticObj["image"]).toBe(fileObj.asset.url);
  expect(semanticObj["encodingFormat"]).toBe(fileObj.asset.mimeType);
});

test("Nested collections are resolved into a single big flattened collection under root", () => {
  const obj = {
    _id: "movie_157336",
    _type: "movie",
    castMembers: [
      {
        person: {
          _ref: "person_matthew-mcconaughey",
          _type: "reference",
        },
        people: [
          {
            _ref: "person_matthew-mcconaughey",
            _type: "reference",
          },
          {
            _ref: "person_jessica-chastain",
            _type: "reference",
          },
        ],
      },
      {
        characterName: "Murph Cooper",
        person: {
          _ref: "person_jessica-chastain",
          _type: "reference",
        },
      },
    ],
    crewMembers: [
      {
        _type: "crewMember",
        person: {
          _ref: "person_kendelle-elliott",
          _type: "reference",
        },
      },
      {
        _type: "crewMember",
        person: {
          _ref: "person_eggert-ketilsson",
          _type: "reference",
        },
      },
    ],
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@type"]).toBe("ItemList");
  expect(semanticObj.itemListElement).toBeInstanceOf(Array);
  expect(semanticObj.itemListElement).toHaveLength(7);
});

test("Deeply nested objects preserve themselves when flattened", () => {
  const obj = {
    person: {
      _ref: "person_matthew-mcconaughey",
      _type: "person",
      _id: "person_matthew-mcconaughey",
      name: "Matthew McConaughey",
      image: {
        _type: "image",
        asset: {
          _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
          _type: "sanity.imageAsset",
          _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
          mimeType: "image/jpeg",
          url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
        },
      },
    },
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@type"]).toBe("ItemList");
  expect(semanticObj.itemListElement).toBeInstanceOf(Array);
  expect(semanticObj.itemListElement).toHaveLength(2);
});

test("Deeply nested documents also yield proper results", () => {
  const obj = {
    person: {
      _ref: "person_matthew-mcconaughey",
      _type: "person",
      _id: "person_matthew-mcconaughey",
      name: "Matthew McConaughey",
      image: {
        _type: "image",
        asset: {
          _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
          _type: "sanity.imageAsset",
          _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
          mimeType: "image/jpeg",
          url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
        },
      },
      crew: [
        {
          person: {
            _ref: "person_matthew-mcconaughey",
            _type: "person",
            _id: "person_matthew-mcconaughey",
            name: "Matthew McConaughey",
            image: {
              _type: "image",
              asset: {
                _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                _type: "sanity.imageAsset",
                _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                mimeType: "image/jpeg",
                url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
              },
            },
            crew: [
              {
                person: {
                  _ref: "person_matthew-mcconaughey",
                  _type: "person",
                  _id: "person_matthew-mcconaughey",
                  name: "Matthew McConaughey",
                  image: {
                    _type: "image",
                    asset: {
                      _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                      _type: "sanity.imageAsset",
                      _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                      mimeType: "image/jpeg",
                      url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
                    },
                  },
                  crew: [
                    {
                      person: {
                        _ref: "person_matthew-mcconaughey",
                        _type: "person",
                        _id: "person_matthew-mcconaughey",
                        name: "Matthew McConaughey",
                        image: {
                          _type: "image",
                          asset: {
                            _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            _type: "sanity.imageAsset",
                            _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            mimeType: "image/jpeg",
                            url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
                          },
                        },
                        slug: {
                          _type: "slug",
                          current: "matthew-mcconaughey",
                          source: "name",
                        },
                      },
                    },
                    {
                      person: {
                        _ref: "person_matthew-mcconaughey",
                        _type: "person",
                        _id: "person_matthew-mcconaughey",
                        name: "Matthew McConaughey",
                        image: {
                          _type: "image",
                          asset: {
                            _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            _type: "sanity.imageAsset",
                            _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            mimeType: "image/jpeg",
                            url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
                          },
                        },
                        slug: {
                          _type: "slug",
                          current: "matthew-mcconaughey",
                          source: "name",
                        },
                      },
                    },
                    {
                      person: {
                        _ref: "person_matthew-mcconaughey",
                        _type: "person",
                        _id: "person_matthew-mcconaughey",
                        name: "Matthew McConaughey",
                        image: {
                          _type: "image",
                          asset: {
                            _ref: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            _type: "sanity.imageAsset",
                            _id: "image-692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278-jpg",
                            mimeType: "image/jpeg",
                            url: "https://cdn.sanity.io/images/bf14pkaa/kubeltdb/692632ed5b59c6986a4a3ff010dded22c661b1ca-185x278.jpg",
                          },
                        },
                        slug: {
                          _type: "slug",
                          current: "matthew-mcconaughey",
                          source: "name",
                        },
                      },
                    },
                  ],
                  slug: {
                    _type: "slug",
                    current: "matthew-mcconaughey",
                    source: "name",
                  },
                },
              },
            ],
            slug: {
              _type: "slug",
              current: "matthew-mcconaughey",
              source: "name",
            },
          },
        },
      ],
      slug: {
        _type: "slug",
        current: "matthew-mcconaughey",
        source: "name",
      },
    },
  };

  const semanticObj = semanticService.semantify(obj);

  expect(semanticObj).not.toBeNull();
  expect(semanticObj["@type"]).toBe("ItemList");
  expect(semanticObj.itemListElement).toBeInstanceOf(Array);
  expect(semanticObj.itemListElement).toHaveLength(12);
});
