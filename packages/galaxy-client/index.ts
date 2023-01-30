import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
  URN: any;
};

export type AddressProfile = {
  __typename?: 'AddressProfile';
  profile: AddressProfiles;
  type: Scalars['String'];
};

export type AddressProfiles = CryptoAddressProfile | OAuthGithubProfile | OAuthGoogleProfile | OAuthMicrosoftProfile | OAuthTwitterProfile;

export type AuthenticationTokenInput = {
  clientId: Scalars['String'];
  code: Scalars['String'];
  grantType: GrantType;
  redirectUri: Scalars['String'];
};

export type AuthorizationTokenInput = {
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  code: Scalars['String'];
  grantType: GrantType;
  redirectUri: Scalars['String'];
  scopes?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type Chain = {
  __typename?: 'Chain';
  chain?: Maybe<Scalars['String']>;
  network?: Maybe<Scalars['String']>;
};

export type Contract = {
  __typename?: 'Contract';
  address?: Maybe<Scalars['String']>;
};

export type ContractInput = {
  address?: InputMaybe<Scalars['String']>;
};

export type ContractMetadata = {
  __typename?: 'ContractMetadata';
  name?: Maybe<Scalars['String']>;
  openSea: OpenSeaMetadata;
  symbol?: Maybe<Scalars['String']>;
  tokenType?: Maybe<TokenType>;
  totalSupply?: Maybe<Scalars['String']>;
};

export type CryptoAddressProfile = {
  __typename?: 'CryptoAddressProfile';
  address: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
};

export type Edge = {
  __typename?: 'Edge';
  dst: Node;
  src: Node;
  tag: Scalars['String'];
};

export type ExchangeTokenResult = {
  __typename?: 'ExchangeTokenResult';
  accessToken: Scalars['String'];
  refreshToken: Scalars['String'];
};

export type Gallery = {
  __typename?: 'Gallery';
  contract: Scalars['String'];
  tokenId: Scalars['String'];
};

export type GalleryInput = {
  contract: Scalars['String'];
  tokenId: Scalars['String'];
};

export enum GrantType {
  AuthenticationCode = 'authentication_code',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token'
}

export type Id = {
  __typename?: 'Id';
  tokenId?: Maybe<Scalars['String']>;
};

export type Link = {
  __typename?: 'Link';
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
};

export type LinkInput = {
  name?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
  verified?: InputMaybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  exchangeAuthorizationToken?: Maybe<ExchangeTokenResult>;
  exchangeRefreshToken?: Maybe<ExchangeTokenResult>;
  updateAddressNickname?: Maybe<Scalars['Boolean']>;
  updateGallery?: Maybe<Scalars['Boolean']>;
  updateLinks?: Maybe<Scalars['Boolean']>;
  updateProfile?: Maybe<Scalars['Boolean']>;
};


export type MutationExchangeAuthorizationTokenArgs = {
  exchange: AuthorizationTokenInput;
};


export type MutationExchangeRefreshTokenArgs = {
  exchange: RefreshTokenInput;
};


export type MutationUpdateAddressNicknameArgs = {
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
};


export type MutationUpdateGalleryArgs = {
  gallery?: InputMaybe<Array<GalleryInput>>;
};


export type MutationUpdateLinksArgs = {
  links?: InputMaybe<Array<LinkInput>>;
};


export type MutationUpdateProfileArgs = {
  profile?: InputMaybe<ProfileInput>;
};

export type Nft = {
  __typename?: 'NFT';
  contract?: Maybe<Contract>;
  contractMetadata?: Maybe<ContractMetadata>;
  description?: Maybe<Scalars['String']>;
  error?: Maybe<Scalars['String']>;
  id?: Maybe<Id>;
  media: Array<NftMedia>;
  metadata?: Maybe<NftMetadata>;
  title?: Maybe<Scalars['String']>;
  tokenUri?: Maybe<TokenUri>;
};

export type NftContract = {
  __typename?: 'NFTContract';
  address?: Maybe<Scalars['String']>;
  chain?: Maybe<Chain>;
  media?: Maybe<NftMedia>;
  name?: Maybe<Scalars['String']>;
  numDistinctTokensOwned?: Maybe<Scalars['Int']>;
  opensea?: Maybe<OpenSeaMetadata>;
  ownedNfts?: Maybe<Array<NftWithChain>>;
  symbol?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  tokenType?: Maybe<Scalars['String']>;
  totalBalance?: Maybe<Scalars['Int']>;
};

export type NftContracts = {
  __typename?: 'NFTContracts';
  contracts: Array<NftContract>;
};

export type NftInput = {
  addressURN?: InputMaybe<Scalars['String']>;
  contract?: InputMaybe<Scalars['String']>;
  tokenId?: InputMaybe<Scalars['String']>;
};

export type NftMedia = {
  __typename?: 'NFTMedia';
  bytes?: Maybe<Scalars['String']>;
  format?: Maybe<Scalars['String']>;
  gateway?: Maybe<Scalars['String']>;
  raw?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type NftMetadata = {
  __typename?: 'NFTMetadata';
  background_color?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  external_url?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  media: Array<NftMedia>;
  name?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<NftProperty>>>;
  timeLastUpdated?: Maybe<Scalars['String']>;
};

export type NftMetadataInput = {
  contractAddress?: InputMaybe<Scalars['String']>;
  tokenId?: InputMaybe<Scalars['String']>;
  tokenType?: InputMaybe<Scalars['String']>;
};

export type NftNoProps = {
  __typename?: 'NFTNoProps';
  contract?: Maybe<Contract>;
  contractMetadata?: Maybe<ContractMetadata>;
  description?: Maybe<Scalars['String']>;
  error?: Maybe<Scalars['String']>;
  id?: Maybe<Id>;
  media: Array<NftMedia>;
  title?: Maybe<Scalars['String']>;
  tokenUri?: Maybe<TokenUri>;
};

export type Nftpfp = Pfp & {
  __typename?: 'NFTPFP';
  image?: Maybe<Scalars['String']>;
  isToken?: Maybe<Scalars['Boolean']>;
};

export type NftProperty = {
  __typename?: 'NFTProperty';
  display?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type NftWithChain = {
  __typename?: 'NFTWithChain';
  chain?: Maybe<Chain>;
  contract?: Maybe<Contract>;
  contractMetadata?: Maybe<ContractMetadata>;
  description?: Maybe<Scalars['String']>;
  error?: Maybe<Scalars['String']>;
  id?: Maybe<Id>;
  media: Array<NftMedia>;
  metadata?: Maybe<NftMetadata>;
  title?: Maybe<Scalars['String']>;
  tokenUri?: Maybe<TokenUri>;
};

export type NfTs = {
  __typename?: 'NFTs';
  ownedNfts: Array<Nft>;
};

export type NfTsNoProps = {
  __typename?: 'NFTsNoProps';
  ownedNfts: Array<NftNoProps>;
};

export type NfTsWithChain = {
  __typename?: 'NFTsWithChain';
  ownedNfts: Array<NftWithChain>;
};

export type Node = {
  __typename?: 'Node';
  fragment?: Maybe<Scalars['String']>;
  nid: Scalars['String'];
  nss: Scalars['String'];
  qc?: Maybe<Scalars['JSON']>;
  rc?: Maybe<Scalars['JSON']>;
  urn: Scalars['String'];
};

export type NodeInput = {
  fragment?: InputMaybe<Scalars['String']>;
  nid: Scalars['String'];
  nss: Scalars['String'];
  qc?: InputMaybe<Scalars['JSON']>;
  rc?: InputMaybe<Scalars['JSON']>;
  urn: Scalars['String'];
};

export type OAuthGithubProfile = {
  __typename?: 'OAuthGithubProfile';
  avatar_url: Scalars['String'];
  bio?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  followers: Scalars['Int'];
  following: Scalars['Int'];
  id: Scalars['Int'];
  location?: Maybe<Scalars['String']>;
  loign: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  public_gists: Scalars['Int'];
  public_repos: Scalars['Int'];
};

export type OAuthGoogleProfile = {
  __typename?: 'OAuthGoogleProfile';
  email: Scalars['String'];
  email_verified: Scalars['Boolean'];
  family_name: Scalars['String'];
  given_name: Scalars['String'];
  locale: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub: Scalars['String'];
};

export type OAuthMicrosoftProfile = {
  __typename?: 'OAuthMicrosoftProfile';
  email: Scalars['String'];
  family_name: Scalars['String'];
  given_name: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub: Scalars['String'];
};

export type OAuthTwitterProfile = {
  __typename?: 'OAuthTwitterProfile';
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  profile_image_url_https: Scalars['String'];
  screen_name: Scalars['String'];
};

export type OpenSeaMetadata = {
  __typename?: 'OpenSeaMetadata';
  collectionName?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  discordUrl?: Maybe<Scalars['String']>;
  externalUrl?: Maybe<Scalars['String']>;
  floorPrice?: Maybe<Scalars['Float']>;
  imageUrl?: Maybe<Scalars['String']>;
  safeListRequestStatus?: Maybe<OpenSeaSafeListStatus>;
  twitterUsername?: Maybe<Scalars['String']>;
};

export enum OpenSeaSafeListStatus {
  Approved = 'approved',
  NotRequested = 'not_requested',
  Requested = 'requested',
  Verified = 'verified'
}

export type Pfp = {
  image?: Maybe<Scalars['String']>;
};

export type PfpInput = {
  image: Scalars['String'];
  isToken?: InputMaybe<Scalars['Boolean']>;
};

export type Profile = {
  __typename?: 'Profile';
  bio?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  defaultAddress?: Maybe<Scalars['URN']>;
  displayName?: Maybe<Scalars['String']>;
  handle?: Maybe<Scalars['String']>;
  job?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  pfp?: Maybe<Pfp>;
  website?: Maybe<Scalars['String']>;
};

export type ProfileInput = {
  bio?: InputMaybe<Scalars['String']>;
  cover?: InputMaybe<Scalars['String']>;
  defaultAddress?: InputMaybe<Scalars['URN']>;
  displayName?: InputMaybe<Scalars['String']>;
  job?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  pfp?: InputMaybe<PfpInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  addressProfile?: Maybe<AddressProfile>;
  addressProfiles?: Maybe<Array<Maybe<AddressProfile>>>;
  addresses?: Maybe<Array<Node>>;
  connectedAddresses?: Maybe<Array<Node>>;
  contractsForAddress?: Maybe<NftContracts>;
  ensProfile?: Maybe<CryptoAddressProfile>;
  gallery?: Maybe<Array<Gallery>>;
  getNFTMetadataBatch?: Maybe<NfTs>;
  links?: Maybe<Array<Link>>;
  nftsForAddress?: Maybe<NfTs>;
  profile?: Maybe<Profile>;
  profileFromAddress?: Maybe<Profile>;
};


export type QueryAddressProfileArgs = {
  addressURN: Scalars['URN'];
};


export type QueryAddressProfilesArgs = {
  addressURNList?: InputMaybe<Array<Scalars['URN']>>;
};


export type QueryContractsForAddressArgs = {
  excludeFilters?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  owner: Scalars['String'];
  pageSize?: InputMaybe<Scalars['Int']>;
};


export type QueryEnsProfileArgs = {
  addressOrEns: Scalars['String'];
};


export type QueryGetNftMetadataBatchArgs = {
  input?: InputMaybe<Array<InputMaybe<NftMetadataInput>>>;
};


export type QueryNftsForAddressArgs = {
  contractAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  owner: Scalars['String'];
};


export type QueryProfileFromAddressArgs = {
  addressURN: Scalars['URN'];
};

export type RefreshTokenInput = {
  grantType: GrantType;
  token: Token;
};

export type StandardPfp = Pfp & {
  __typename?: 'StandardPFP';
  image?: Maybe<Scalars['String']>;
};

export type Token = {
  iss: Scalars['String'];
  token: Scalars['String'];
};

export enum TokenType {
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155',
  Unknown = 'UNKNOWN'
}

export type TokenUri = {
  __typename?: 'TokenURI';
  gateway?: Maybe<Scalars['String']>;
  raw?: Maybe<Scalars['String']>;
};

export type TokenUriInput = {
  gateway?: InputMaybe<Scalars['String']>;
  raw?: InputMaybe<Scalars['String']>;
};

export type ExchangeTokenMutationVariables = Exact<{
  exchange: AuthorizationTokenInput;
}>;


export type ExchangeTokenMutation = { __typename?: 'Mutation', exchangeAuthorizationToken?: { __typename?: 'ExchangeTokenResult', accessToken: string, refreshToken: string } | null };

export type RefreshTokenMutationVariables = Exact<{
  exchange: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', exchangeRefreshToken?: { __typename?: 'ExchangeTokenResult', accessToken: string, refreshToken: string } | null };

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'Profile', displayName?: string | null, handle?: string | null, defaultAddress?: any | null, cover?: string | null, location?: string | null, job?: string | null, bio?: string | null, website?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null, links?: Array<{ __typename?: 'Link', name?: string | null, url?: string | null, verified?: boolean | null }> | null, addresses?: Array<{ __typename?: 'Node', urn: string, nid: string, nss: string, fragment?: string | null, qc?: any | null, rc?: any | null }> | null, gallery?: Array<{ __typename?: 'Gallery', contract: string, tokenId: string }> | null };

export type GetProfileFromAddressQueryVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type GetProfileFromAddressQuery = { __typename?: 'Query', profileFromAddress?: { __typename?: 'Profile', displayName?: string | null, handle?: string | null, defaultAddress?: any | null, cover?: string | null, location?: string | null, job?: string | null, bio?: string | null, website?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null, links?: Array<{ __typename?: 'Link', name?: string | null, url?: string | null, verified?: boolean | null }> | null, addresses?: Array<{ __typename?: 'Node', urn: string, nid: string, nss: string, fragment?: string | null, qc?: any | null, rc?: any | null }> | null, gallery?: Array<{ __typename?: 'Gallery', contract: string, tokenId: string }> | null };

export type GetConnectedAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConnectedAddressesQuery = { __typename?: 'Query', connectedAddresses?: Array<{ __typename?: 'Node', urn: string, nid: string, nss: string, fragment?: string | null, qc?: any | null, rc?: any | null }> | null };

export type UpdateProfileMutationVariables = Exact<{
  profile?: InputMaybe<ProfileInput>;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile?: boolean | null };

export type UpdateLinksMutationVariables = Exact<{
  links?: InputMaybe<Array<LinkInput> | LinkInput>;
}>;


export type UpdateLinksMutation = { __typename?: 'Mutation', updateLinks?: boolean | null };

export type UpdateGalleryMutationVariables = Exact<{
  gallery?: InputMaybe<Array<GalleryInput> | GalleryInput>;
}>;


export type UpdateGalleryMutation = { __typename?: 'Mutation', updateGallery?: boolean | null };

export type GetAddressProfileQueryVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type GetAddressProfileQuery = { __typename?: 'Query', addressProfile?: { __typename?: 'AddressProfile', type: string, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'OAuthGithubProfile', name?: string | null, avatar_url: string } | { __typename: 'OAuthGoogleProfile', name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string } | { __typename: 'OAuthTwitterProfile', name?: string | null, profile_image_url_https: string } } | null };

export type GetAddressProfilesQueryVariables = Exact<{
  addressURNList?: InputMaybe<Array<Scalars['URN']> | Scalars['URN']>;
}>;


export type GetAddressProfilesQuery = { __typename?: 'Query', addressProfiles?: Array<{ __typename?: 'AddressProfile', type: string, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'OAuthGithubProfile', name?: string | null, avatar_url: string } | { __typename: 'OAuthGoogleProfile', name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string } | { __typename: 'OAuthTwitterProfile', name?: string | null, profile_image_url_https: string } } | null> | null };

export type UpdateAddressNicknameMutationVariables = Exact<{
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
}>;


export type UpdateAddressNicknameMutation = { __typename?: 'Mutation', updateAddressNickname?: boolean | null };

export type GetEnsProfileQueryVariables = Exact<{
  addressOrEns: Scalars['String'];
}>;


export type GetEnsProfileQuery = { __typename?: 'Query', ensProfile?: { __typename?: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | null };

export type GetNftsForAddressQueryVariables = Exact<{
  owner: Scalars['String'];
  contractAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
}>;


export type GetNftsForAddressQuery = { __typename?: 'Query', nftsForAddress?: { __typename?: 'NFTs', ownedNfts: Array<{ __typename?: 'NFT', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null }> } | null };

export type GetNftsPerCollectionQueryVariables = Exact<{
  owner: Scalars['String'];
  excludeFilters?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
  pageSize?: InputMaybe<Scalars['Int']>;
}>;


export type GetNftsPerCollectionQuery = { __typename?: 'Query', contractsForAddress?: { __typename?: 'NFTContracts', contracts: Array<{ __typename?: 'NFTContract', address?: string | null, totalBalance?: number | null, numDistinctTokensOwned?: number | null, name?: string | null, symbol?: string | null, tokenType?: string | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null, ownedNfts?: Array<{ __typename?: 'NFTWithChain', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null }> | null }> } | null };

export type GetNftMetadataQueryVariables = Exact<{
  input?: InputMaybe<Array<InputMaybe<NftMetadataInput>> | InputMaybe<NftMetadataInput>>;
}>;


export type GetNftMetadataQuery = { __typename?: 'Query', getNFTMetadataBatch?: { __typename?: 'NFTs', ownedNfts: Array<{ __typename?: 'NFT', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null }> } | null };


export const ExchangeTokenDocument = gql`
    mutation exchangeToken($exchange: AuthorizationTokenInput!) {
  exchangeAuthorizationToken(exchange: $exchange) {
    accessToken
    refreshToken
  }
}
    `;
export const RefreshTokenDocument = gql`
    mutation refreshToken($exchange: RefreshTokenInput!) {
  exchangeRefreshToken(exchange: $exchange) {
    accessToken
    refreshToken
  }
}
    `;
export const GetProfileDocument = gql`
    query getProfile {
  profile {
    pfp {
      ... on StandardPFP {
        image
      }
      ... on NFTPFP {
        image
        isToken
      }
    }
    displayName
    handle
    defaultAddress
    cover
    location
    job
    bio
    website
  }
  links {
    name
    url
    verified
  }
  addresses {
    urn
    nid
    nss
    fragment
    qc
    rc
  }
  gallery {
    contract
    tokenId
  }
}
    `;
export const GetProfileFromAddressDocument = gql`
    query getProfileFromAddress($addressURN: URN!) {
  profileFromAddress(addressURN: $addressURN) {
    pfp {
      ... on StandardPFP {
        image
      }
      ... on NFTPFP {
        image
        isToken
      }
    }
    displayName
    handle
    defaultAddress
    cover
    location
    job
    bio
    website
  }
  links {
    name
    url
    verified
  }
  addresses {
    urn
    nid
    nss
    fragment
    qc
    rc
  }
  gallery {
    contract
    tokenId
  }
}
    `;
export const GetConnectedAddressesDocument = gql`
    query getConnectedAddresses {
  connectedAddresses {
    urn
    nid
    nss
    fragment
    qc
    rc
  }
}
    `;
export const UpdateProfileDocument = gql`
    mutation updateProfile($profile: ProfileInput) {
  updateProfile(profile: $profile)
}
    `;
export const UpdateLinksDocument = gql`
    mutation updateLinks($links: [LinkInput!]) {
  updateLinks(links: $links)
}
    `;
export const UpdateGalleryDocument = gql`
    mutation updateGallery($gallery: [GalleryInput!]) {
  updateGallery(gallery: $gallery)
}
    `;
export const GetAddressProfileDocument = gql`
    query getAddressProfile($addressURN: URN!) {
  addressProfile(addressURN: $addressURN) {
    type
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        name
        avatar_url
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
      }
    }
  }
}
    `;
export const GetAddressProfilesDocument = gql`
    query getAddressProfiles($addressURNList: [URN!]) {
  addressProfiles(addressURNList: $addressURNList) {
    type
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        name
        avatar_url
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
      }
    }
  }
}
    `;
export const UpdateAddressNicknameDocument = gql`
    mutation updateAddressNickname($addressURN: URN!, $nickname: String!) {
  updateAddressNickname(addressURN: $addressURN, nickname: $nickname)
}
    `;
export const GetEnsProfileDocument = gql`
    query getEnsProfile($addressOrEns: String!) {
  ensProfile(addressOrEns: $addressOrEns) {
    address
    avatar
    displayName
  }
}
    `;
export const GetNftsForAddressDocument = gql`
    query getNftsForAddress($owner: String!, $contractAddresses: [String]) {
  nftsForAddress(owner: $owner, contractAddresses: $contractAddresses) {
    ownedNfts {
      contract {
        address
      }
      title
      description
      id {
        tokenId
      }
      media {
        raw
        thumbnail
      }
      metadata {
        properties {
          name
          value
          display
        }
      }
      error
      contractMetadata {
        name
        tokenType
      }
    }
  }
}
    `;
export const GetNftsPerCollectionDocument = gql`
    query getNftsPerCollection($owner: String!, $excludeFilters: [String], $pageSize: Int) {
  contractsForAddress(
    owner: $owner
    excludeFilters: $excludeFilters
    pageSize: $pageSize
  ) {
    contracts {
      address
      totalBalance
      numDistinctTokensOwned
      name
      symbol
      tokenType
      chain {
        chain
        network
      }
      ownedNfts {
        contract {
          address
        }
        title
        description
        id {
          tokenId
        }
        media {
          raw
          thumbnail
        }
        metadata {
          properties {
            name
            value
            display
          }
        }
        error
        contractMetadata {
          name
          tokenType
        }
        chain {
          chain
          network
        }
      }
    }
  }
}
    `;
export const GetNftMetadataDocument = gql`
    query getNFTMetadata($input: [NFTMetadataInput]) {
  getNFTMetadataBatch(input: $input) {
    ownedNfts {
      contract {
        address
      }
      title
      description
      id {
        tokenId
      }
      media {
        raw
        thumbnail
      }
      metadata {
        properties {
          name
          value
          display
        }
      }
      error
      contractMetadata {
        name
        tokenType
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    exchangeToken(variables: ExchangeTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ExchangeTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExchangeTokenMutation>(ExchangeTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'exchangeToken', 'mutation');
    },
    refreshToken(variables: RefreshTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RefreshTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RefreshTokenMutation>(RefreshTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'refreshToken', 'mutation');
    },
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    },
    getProfileFromAddress(variables: GetProfileFromAddressQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileFromAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileFromAddressQuery>(GetProfileFromAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfileFromAddress', 'query');
    },
    getConnectedAddresses(variables?: GetConnectedAddressesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConnectedAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConnectedAddressesQuery>(GetConnectedAddressesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getConnectedAddresses', 'query');
    },
    updateProfile(variables?: UpdateProfileMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateProfileMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProfileMutation>(UpdateProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateProfile', 'mutation');
    },
    updateLinks(variables?: UpdateLinksMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateLinksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateLinksMutation>(UpdateLinksDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateLinks', 'mutation');
    },
    updateGallery(variables?: UpdateGalleryMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateGalleryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateGalleryMutation>(UpdateGalleryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateGallery', 'mutation');
    },
    getAddressProfile(variables: GetAddressProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfileQuery>(GetAddressProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfile', 'query');
    },
    getAddressProfiles(variables?: GetAddressProfilesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfilesQuery>(GetAddressProfilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfiles', 'query');
    },
    updateAddressNickname(variables: UpdateAddressNicknameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateAddressNicknameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAddressNicknameMutation>(UpdateAddressNicknameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateAddressNickname', 'mutation');
    },
    getEnsProfile(variables: GetEnsProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetEnsProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEnsProfileQuery>(GetEnsProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getEnsProfile', 'query');
    },
    getNftsForAddress(variables: GetNftsForAddressQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNftsForAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNftsForAddressQuery>(GetNftsForAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getNftsForAddress', 'query');
    },
    getNftsPerCollection(variables: GetNftsPerCollectionQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNftsPerCollectionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNftsPerCollectionQuery>(GetNftsPerCollectionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getNftsPerCollection', 'query');
    },
    getNFTMetadata(variables?: GetNftMetadataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNftMetadataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNftMetadataQuery>(GetNftMetadataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getNFTMetadata', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;