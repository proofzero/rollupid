// Based on Alchemy's NFT and response types.
// Treating bytes arrays as Strings for now. Could also do [Int].
// NFTMetadata probably needs a 'properties' field. Limited Alchemy docs on this.
export default /* GraphQL */ `
  enum TokenType {
    UNKNOWN
    ERC721
    ERC1155
  }

  enum OpenSeaSafeListStatus {
    not_requested
    requested
    approved
    verified
  }

  type OpenSeaMetadata {
    floorPrice: Float
    collectionName: String
    safeListRequestStatus: OpenSeaSafeListStatus
    imageUrl: String
    description: String
    externalUrl: String
    twitterUsername: String
    discordUrl: String
  }

  type NFTMedia {
    raw: String
    gateway: String
    thumbnail: String
    format: String
    bytes: String
  }

  type ContractMetadata {
    name: String
    symbol: String
    totalSupply: String
    tokenType: TokenType
    openSea: OpenSeaMetadata!
  }

  type Contract {
    address: String
  }

  type Id {
    tokenId: String
  }

  type TokenURI {
    raw: String
    gateway: String
  }

  type NFTProperty {
    name: String
    value: String
    display: String
  }

  type NFTMetadata {
    image: String
    external_url: String
    background_color: String
    name: String
    description: String
    properties: [NFTProperty]
    media: [NFTMedia!]!
    timeLastUpdated: String
  }
  type NFT {
    contract: Contract
    title: String
    description: String
    id: Id
    tokenUri: TokenURI
    media: [NFTMedia!]!
    error: String
    metadata: NFTMetadata
    contractMetadata: ContractMetadata
  }

  type NFTNoProps {
    contract: Contract
    title: String
    description: String
    id: Id
    tokenUri: TokenURI
    media: [NFTMedia!]!
    error: String
    contractMetadata: ContractMetadata
  }

  type NFTs {
    ownedNfts: [NFT!]!
  }

  type NFTsNoProps {
    ownedNfts: [NFTNoProps!]!
  }

  type Chain {
    chain: String
    network: String
  }

  type NFTWithChain {
    contract: Contract
    title: String
    description: String
    id: Id
    tokenUri: TokenURI
    media: [NFTMedia!]!
    error: String
    metadata: NFTMetadata
    contractMetadata: ContractMetadata
    chain: Chain
  }

  type NFTsWithChain {
    ownedNfts: [NFTWithChain!]!
  }

  type NFTContract {
    address: String
    totalBalance: Int
    numDistinctTokensOwned: Int
    tokenId: String
    name: String
    symbol: String
    tokenType: String
    media: NFTMedia
    opensea: OpenSeaMetadata
    ownedNfts: [NFTWithChain!]
    chain: Chain
  }

  type NFTContracts {
    contracts: [NFTContract!]!
  }

  type Gallery {
    contract: String!
    tokenId: String!
  }

  input ContractInput {
    address: String
  }

  input TokenURIInput {
    raw: String
    gateway: String
  }

  input NFTInput {
    tokenId: String
    contract: String
    addressURN: String
  }

  input NFTMetadataInput {
    contractAddress: String
    tokenId: String
    tokenType: String
  }

  input GalleryInput {
    contract: String!
    tokenId: String!
  }

  type Query {
    nftsForAddress(owner: String!, contractAddresses: [String]): NFTs
    contractsForAddress(
      owner: String!
      excludeFilters: [String]
      pageSize: Int
    ): NFTContracts
    getNFTMetadataBatch(input: [NFTMetadataInput]): NFTs
  }
`
