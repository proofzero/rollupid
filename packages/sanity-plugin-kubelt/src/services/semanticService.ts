import {
  ItemList,
  Thing,
  WithContext,
  ImageObject,
  DigitalDocument,
} from "schema-dts";
import { IDocumentPart, ISanityService } from "./sanityService";

export interface ISemanticService {
  /**
   * Recursively traverses expanded Sanity object,
   * adnotating data up to Schema.org spec
   * and flattens resulting hierarchical structure
   * for easier transformation into quads
   */
  semantify(destructuredObject: any): any;
}

export class SemanticService implements ISemanticService {
  private _sanityService: ISanityService;

  constructor(sanityService: ISanityService) {
    this._sanityService = sanityService;
  }

  /**
   * Contains all different object handling,
   * Add new ones here as we decide on new type of documents to adnotate.
   */
  private readonly documentPartHandlerDict: {
    [key: string]: (documentPart: any) => any;
  } = {
    image: this.handleImage.bind(this),
    file: this.handleFile.bind(this),
    reference: this.handleReference.bind(this),
  };

  public semantify(destructuredObject: any) {
    if (destructuredObject === null) return null;

    const metadata = this.getJsonLdMetadata(destructuredObject);
    const flattenedLists = this.flattenMetadataLists(metadata);
    const concatLists = flattenedLists.reduce(
      (acc: [], val: []) => acc.concat(val),
      []
    );

    if (concatLists.length === 0 && !metadata) return null;
    if (concatLists.length > 0) metadata.itemListElement = concatLists;

    const obj: WithContext<ItemList> = {
      "@context": "https://schema.org",
      ...metadata,
    };

    return obj;
  }

  /**
   * Recursively visit child as well as sub-objects
   * transforming them according to Schema.org requirements
   * and appending property data where there are known properties
   * @param endpoint property valid is true if data was encountered for at least one leaf
   */
  private getJsonLdMetadata(
    child: IDocumentPart,
    endpoint: { valid: boolean } = null
  ) {
    // Handle null and empty object case
    if (
      child === null ||
      (Object.keys(child).length === 0 &&
        Object.getPrototypeOf(child) === Object.prototype)
    )
      return null;

    if (Array.isArray(child)) return this.handleArray(child);

    if (this.documentPartHandlerDict[child._type]) {
      if (endpoint) endpoint.valid = true;
      return this.documentPartHandlerDict[child._type](child);
    }

    const children = Object.keys(child)
      .filter((key) => child[key] === Object(child[key]))
      .filter(
        (key) =>
          child[key]._id ||
          this.documentPartHandlerDict[child[key]._type] ||
          Array.isArray(child[key])
      )
      .map((key) => this.getJsonLdMetadata(child[key], endpoint));

    if (children.length > 0) {
      const viableChildren = children.filter((c) => c !== null);

      const itemList: ItemList = {
        "@type": "ItemList",
        itemListElement: viableChildren,
      };

      if (child.name) itemList.name = child.name;

      this.setId(itemList, child._id);

      if (viableChildren.length === 0 && !this.checkId(itemList)) {
        return null;
      }

      return itemList;
    }

    const thing: Thing = {
      "@type": "Thing",
    };

    if (child.name) thing.name = child.name;

    this.setId(thing, child._id);

    if (this.checkId(thing)) {
      if (endpoint) endpoint.valid = true;

      return thing;
    }

    return null;
  }

  /**
   * Flattens ItemLists so they can be used in the Kubelt SDK
   * @returns a new array resulting from the concatenation of all ItemLists across all hierarchical levels
   */
  private flattenMetadataLists(metadata: any) {
    if (metadata === null) {
      return [];
    }

    const thing: Thing = {
      "@type": "Thing",
    };

    if (this.checkId(metadata)) {
      this.setId(thing, metadata["@id"]);
    }

    if (metadata.name && metadata.name !== "") {
      thing.name = metadata.name;
    }

    if (!Array.isArray(metadata.itemListElement)) return [thing];

    const flattenedSublists = metadata.itemListElement
      .filter((el) => el["@type"] === "ItemList")
      .flatMap((el) => this.flattenMetadataLists(el));

    const remainingItems = metadata.itemListElement.filter(
      (el) => el["@type"] !== "ItemList"
    );
    const flattenedChildren = remainingItems.concat(flattenedSublists);

    const resChildren = flattenedChildren.slice();

    if (this.checkId(metadata)) {
      resChildren.push(thing);
    }

    return resChildren;
  }

  /**
   * Generate a Kubelt id and patch both the Sanity and the Kubelt ids onto the object.
   * Properties '@id' and 'identifier' are used to conform to both Sanity and Schema.org.
   * @param object Any object on which you want to set '@id' and 'identifier'
   * @param id Sanity id of the document referenced by object
   * @returns If id is valid, patches the object with the new generated ids, else does nothing
   */
  private setId(object: any, id: string | null | undefined) {
    if (!id || object === null) return null;

    const formattedId = `https://sanity.com/${this._sanityService.Config.projectId}/${this._sanityService.Config.dataset}/${id}`;
    object["@id"] = formattedId;
    object.identifier = id;
  }

  private checkId(object: any) {
    return Object.keys(object).includes("@id");
  }

  /**
   * Adnotate the expanded image part with ImageObject Schema.org type
   * filling in 'image' (basically url) and 'encodingFormat' properties.
   */
  private handleImage(expandedImagePart: any) {
    const imageObject: ImageObject = {
      "@type": "ImageObject",
      image: expandedImagePart.asset.url,
      encodingFormat: expandedImagePart.asset.mimeType,
    };

    return imageObject;
  }

  /**
   * Adnotate the expanded file part with DigitalDocument Schema.org type
   * filling in 'url' and 'encodingFormat' properties.
   */
  private handleFile(fileObject: any) {
    const digitalDocument: DigitalDocument = {
      "@type": "DigitalDocument",
      url: fileObject.asset.url,
      encodingFormat: fileObject.asset.mimeType,
    };

    return digitalDocument;
  }

  /**
   * Adnotate reference with Thing Schema.org type
   * attempting to set an identifier from the _ref property.
   *
   * If no id can be reasoned, it's just not set.
   */
  private handleReference(fileObject: any) {
    const thing: Thing = {
      "@type": "Thing",
    };
    this.setId(thing, fileObject._ref);

    return thing;
  }

  /**
   * Adnotate all known objects in array
   * @param array An array ideally of Sanity document parts or objects covered in handlers
   * @returns An array of the adnotated objects or null if trunk has no real children
   */
  private handleArray(array: any[]) {
    // Endpoint is a bit of a hack
    // because this recursive function adnotates
    // arrays with one child, it can result in a lot of nested empty arrays
    // which is why I push this memory so that if nothing is encountered
    // down the line it will just return null
    const endpoint = { valid: false };
    const children = array.map((ae) => this.getJsonLdMetadata(ae, endpoint));

    if (!endpoint.valid || children.length === 0) return null;

    const itemList: ItemList = {
      "@type": "ItemList",
      itemListElement: children,
    };

    return itemList;
  }
}

export default SemanticService;
