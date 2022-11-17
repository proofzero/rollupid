// For NFTScan see https://docs.nftscan.com/nftscan/Asset%20Model
// Notes:
// - token_id is an integer, but is actually an unsigned 256 bit value,
// for example in Ethereum. GraphQL supports 32 bit ints, therefore we
// call token_id a String.
// type NFTs {
//     accout_address: String!
//     erc_type: TokenType!
//     contract_address: String!
//     cursor: String!
//     limit: Int!
//     show_attribute: Boolean!
// }

export default /* GraphQL */ `
    enum TokenType {
        erc721
        erc1155
    }

    type Token {
        contract_address: ID
        contract_name: String
        contract_token_id: ID
        token_id: String
        erc_type: TokenType
    }

    type NFTs {
        total: Int
        next: ID
        content: [Token!]
    }

    type Query {
        nftsForAddress(address: String): NFTs
    }
`;
