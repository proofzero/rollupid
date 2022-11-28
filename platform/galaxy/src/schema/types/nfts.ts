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

    type TokenURI {
        raw: String
        gateway: String
    }

    type NFTAttribute {
        value: String
        trait_type: String
    }

    type NFTMetadata {
        image: String
        external_url: String
        background_color: String
        name: String
        description: String
        attributes: [NFTAttribute!]
        media: [NFTMedia!]!
        timeLastUpdated: String
    }

    type NFT {
        contract: Contract
        title: String
        description: String
        tokenUri: TokenURI
        media: [NFTMedia!]!
        error: String
        metadata: NFTMetadata
        contractMetadata: ContractMetadata
    }

    type NFTs {
        ownedNfts: [NFT!]!
        pageKey: String
        totalCount: String
        blockHash: String
    }

    type Query {
        nftsForAddress(address: String!): NFTs
    }
`