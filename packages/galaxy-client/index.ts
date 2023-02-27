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
  profile: AddressProfilesUnion;
  type: Scalars['String'];
  urn: Scalars['URN'];
};

export type AddressProfilesUnion = CryptoAddressProfile | OAuthAppleProfile | OAuthDiscordProfile | OAuthGithubProfile | OAuthGoogleProfile | OAuthMicrosoftProfile | OAuthTwitterProfile;

export type App = {
  __typename?: 'App';
  clientId: Scalars['String'];
  icon: Scalars['String'];
  timestamp: Scalars['Float'];
  title: Scalars['String'];
};

export type Chain = {
  __typename?: 'Chain';
  chain?: Maybe<Scalars['String']>;
  network?: Maybe<Scalars['String']>;
};

export type ConnectedAddressPropertiesUpdateInput = {
  addressURN: Scalars['URN'];
  public?: InputMaybe<Scalars['Boolean']>;
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

export type Gallery = {
  __typename?: 'Gallery';
  chain: Scalars['String'];
  contract: Scalars['String'];
  tokenId: Scalars['String'];
};

export type GalleryInput = {
  chain: Scalars['String'];
  contract: Scalars['String'];
  tokenId: Scalars['String'];
};

export type Id = {
  __typename?: 'Id';
  tokenId?: Maybe<Scalars['String']>;
};

export type Link = {
  __typename?: 'Link';
  name?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
};

export type LinkInput = {
  name?: InputMaybe<Scalars['String']>;
  provider?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
  verified?: InputMaybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  disconnectAddress?: Maybe<Scalars['Boolean']>;
  updateAddressNickname?: Maybe<Scalars['Boolean']>;
  updateConnectedAddressesProperties?: Maybe<Scalars['Boolean']>;
  updateGallery?: Maybe<Scalars['Boolean']>;
  updateLinks?: Maybe<Scalars['Boolean']>;
  updateProfile?: Maybe<Scalars['Boolean']>;
};


export type MutationDisconnectAddressArgs = {
  addressURN: Scalars['URN'];
};


export type MutationRevokeAuthorizationsArgs = {
  clientId: Scalars['String']
  clientSecret: Scalars['String']
}

export type MutationUpdateAddressNicknameArgs = {
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
};


export type MutationUpdateConnectedAddressesPropertiesArgs = {
  addressURNList: Array<ConnectedAddressPropertiesUpdateInput>;
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
  balance?: Maybe<Scalars['String']>;
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

export type NftContract = {
  __typename?: 'NFTContract';
  address?: Maybe<Scalars['String']>;
  chain?: Maybe<Chain>;
  contractDeployer?: Maybe<Scalars['String']>;
  deployedBlockNumber?: Maybe<Scalars['Int']>;
  isSpam?: Maybe<Scalars['Boolean']>;
  media?: Maybe<NftMedia>;
  name?: Maybe<Scalars['String']>;
  numDistinctTokensOwned?: Maybe<Scalars['Int']>;
  opensea?: Maybe<OpenSeaMetadata>;
  ownedNfts?: Maybe<Array<Nft>>;
  symbol?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  tokenType?: Maybe<Scalars['String']>;
  totalBalance?: Maybe<Scalars['Int']>;
};

export type NftContracts = {
  __typename?: 'NFTContracts';
  contracts: Array<NftContract>;
  totalCount?: Maybe<Scalars['Int']>;
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
  chain?: InputMaybe<Scalars['String']>;
  contractAddress?: InputMaybe<Scalars['String']>;
  tokenId?: InputMaybe<Scalars['String']>;
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
  ownedNfts: Array<Nft>;
};

export type Node = {
  __typename?: 'Node';
  baseUrn: Scalars['String'];
  qc?: Maybe<Scalars['JSON']>;
  rc?: Maybe<Scalars['JSON']>;
};

export type NodeInput = {
  baseUrn: Scalars['String'];
  qc?: InputMaybe<Scalars['JSON']>;
  rc?: InputMaybe<Scalars['JSON']>;
};

export type OAuthAppleProfile = {
  __typename?: 'OAuthAppleProfile';
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthDiscordProfile = {
  __typename?: 'OAuthDiscordProfile';
  avatar?: Maybe<Scalars['String']>;
  discriminator?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type OAuthGithubProfile = {
  __typename?: 'OAuthGithubProfile';
  avatar_url: Scalars['String'];
  bio?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  followers?: Maybe<Scalars['Int']>;
  following?: Maybe<Scalars['Int']>;
  html_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  location?: Maybe<Scalars['String']>;
  login: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  public_gists?: Maybe<Scalars['Int']>;
  public_repos?: Maybe<Scalars['Int']>;
};

export type OAuthGoogleProfile = {
  __typename?: 'OAuthGoogleProfile';
  email?: Maybe<Scalars['String']>;
  email_verified?: Maybe<Scalars['Boolean']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthMicrosoftProfile = {
  __typename?: 'OAuthMicrosoftProfile';
  email?: Maybe<Scalars['String']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthTwitterProfile = {
  __typename?: 'OAuthTwitterProfile';
  id?: Maybe<Scalars['Int']>;
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
  displayName?: InputMaybe<Scalars['String']>;
  job?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  pfp?: InputMaybe<PfpInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  account: Scalars['URN'];
  addressProfile: AddressProfile;
  addressProfiles: Array<AddressProfile>;
  authorizedApps?: Maybe<Array<Maybe<App>>>;
  connectedAddresses?: Maybe<Array<Node>>;
  contractsForAddress?: Maybe<NftContracts>;
  ensProfile: CryptoAddressProfile;
  gallery?: Maybe<Array<Gallery>>;
  getNFTMetadataBatch?: Maybe<NfTs>;
  links?: Maybe<Array<Link>>;
  nftsForAddress?: Maybe<NfTs>;
  profile?: Maybe<Profile>;
  scopes: Array<Maybe<Scope>>;
};


export type QueryAccountArgs = {
  addressURN: Scalars['URN'];
};


export type QueryAddressProfileArgs = {
  addressURN: Scalars['URN'];
};


export type QueryAddressProfilesArgs = {
  addressURNList?: InputMaybe<Array<Scalars['URN']>>;
};


export type QueryConnectedAddressesArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryContractsForAddressArgs = {
  excludeFilters?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  owner: Scalars['String'];
  pageSize?: InputMaybe<Scalars['Int']>;
};


export type QueryEnsProfileArgs = {
  addressOrEns: Scalars['String'];
};


export type QueryGalleryArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryGetNftMetadataBatchArgs = {
  input?: InputMaybe<Array<InputMaybe<NftMetadataInput>>>;
};


export type QueryLinksArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryNftsForAddressArgs = {
  contractAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  owner: Scalars['String'];
};


export type QueryProfileArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryScopesArgs = {
  clientId: Scalars['String'];
};

export type Scope = {
  __typename?: 'Scope';
  permission: Scalars['String'];
  scopes: Array<Maybe<Scalars['String']>>;
};

export type StandardPfp = Pfp & {
  __typename?: 'StandardPFP';
  image?: Maybe<Scalars['String']>;
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

export type GetProfileQueryVariables = Exact<{
  targetAccountURN?: InputMaybe<Scalars['URN']>;
}>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'Profile', displayName?: string | null, handle?: string | null, cover?: string | null, location?: string | null, job?: string | null, bio?: string | null, website?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null, links?: Array<{ __typename?: 'Link', name?: string | null, url?: string | null, verified?: boolean | null, provider?: string | null }> | null, connectedAddresses?: Array<{ __typename?: 'Node', baseUrn: string, qc?: any | null, rc?: any | null }> | null, gallery?: Array<{ __typename?: 'Gallery', contract: string, tokenId: string, chain: string }> | null };

export type GetConnectedAddressesQueryVariables = Exact<{
  targetAccountURN?: InputMaybe<Scalars['URN']>;
}>;


export type GetConnectedAddressesQuery = { __typename?: 'Query', addresses?: Array<{ __typename?: 'Node', baseUrn: string, qc?: any | null, rc?: any | null }> | null };

export type GetAuthorizedAppsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthorizedAppsQuery = { __typename?: 'Query', authorizedApps?: Array<{ __typename?: 'App', clientId: string, icon: string, title: string, timestamp: number } | null> | null };

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

export type DisconnectAddressMutationVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type DisconnectAddressMutation = { __typename?: 'Mutation', disconnectAddress?: boolean | null };

export type GetAddressProfileQueryVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type GetAddressProfileQuery = { __typename?: 'Query', addressProfile: { __typename?: 'AddressProfile', type: string, urn: any, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'OAuthAppleProfile', name?: string | null, picture: string } | { __typename: 'OAuthDiscordProfile', email?: string | null, username?: string | null, discriminator?: string | null, avatar?: string | null, discordId?: string | null } | { __typename: 'OAuthGithubProfile', id?: number | null, name?: string | null, avatar_url: string, html_url?: string | null, followers?: number | null, following?: number | null, login: string, public_gists?: number | null, public_repos?: number | null } | { __typename: 'OAuthGoogleProfile', email?: string | null, name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthTwitterProfile', name?: string | null, screen_name: string, profile_image_url_https: string } } };

export type GetAddressProfilesQueryVariables = Exact<{
  addressURNList?: InputMaybe<Array<Scalars['URN']> | Scalars['URN']>;
}>;


export type GetAddressProfilesQuery = { __typename?: 'Query', addressProfiles: Array<{ __typename?: 'AddressProfile', type: string, urn: any, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'OAuthAppleProfile', name?: string | null, picture: string } | { __typename: 'OAuthDiscordProfile', email?: string | null, username?: string | null, discriminator?: string | null, avatar?: string | null, discordId?: string | null } | { __typename: 'OAuthGithubProfile', id?: number | null, name?: string | null, avatar_url: string, html_url?: string | null, followers?: number | null, following?: number | null, login: string, public_gists?: number | null, public_repos?: number | null } | { __typename: 'OAuthGoogleProfile', email?: string | null, name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthTwitterProfile', name?: string | null, screen_name: string, profile_image_url_https: string } }> };

export type GetAccountUrnFromAddressQueryVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type GetAccountUrnFromAddressQuery = { __typename?: 'Query', account: any };

export type UpdateAddressNicknameMutationVariables = Exact<{
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
}>;


export type UpdateAddressNicknameMutation = { __typename?: 'Mutation', updateAddressNickname?: boolean | null };

export type UpdateConnectedAddressesPropertiesMutationVariables = Exact<{
  addressURNList: Array<ConnectedAddressPropertiesUpdateInput> | ConnectedAddressPropertiesUpdateInput;
}>;


export type UpdateConnectedAddressesPropertiesMutation = { __typename?: 'Mutation', updateConnectedAddressesProperties?: boolean | null };

export type GetAuthorizedAppScopesQueryVariables = Exact<{
  clientId: Scalars['String'];
}>;


export type GetAuthorizedAppScopesQuery = { __typename?: 'Query', scopes: Array<{ __typename?: 'Scope', permission: string, scopes: Array<string | null> } | null> };

export type RevokeAuthorizationsMutationVariables = Exact<{
  clientId: Scalars['String']
  clientSecret: Scalars['String']
}>

export type RevokeAuthorizationsMutation = {
  __typename?: 'Mutation'
  revokeAuthorizations?: boolean | null
}

export type GetEnsProfileQueryVariables = Exact<{
  addressOrEns: Scalars['String'];
}>;


export type GetEnsProfileQuery = { __typename?: 'Query', ensProfile: { __typename?: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } };

export type GetNftsForAddressQueryVariables = Exact<{
  owner: Scalars['String'];
  contractAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
}>;


export type GetNftsForAddressQuery = { __typename?: 'Query', nftsForAddress?: { __typename?: 'NFTs', ownedNfts: Array<{ __typename?: 'NFT', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null }> } | null };

export type GetNftsPerCollectionQueryVariables = Exact<{
  owner: Scalars['String'];
  excludeFilters?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
  pageSize?: InputMaybe<Scalars['Int']>;
}>;


export type GetNftsPerCollectionQuery = { __typename?: 'Query', contractsForAddress?: { __typename?: 'NFTContracts', contracts: Array<{ __typename?: 'NFTContract', address?: string | null, totalBalance?: number | null, numDistinctTokensOwned?: number | null, name?: string | null, symbol?: string | null, tokenType?: string | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null, ownedNfts?: Array<{ __typename?: 'NFT', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null }> | null }> } | null };

export type GetNftMetadataQueryVariables = Exact<{
  input?: InputMaybe<Array<InputMaybe<NftMetadataInput>> | InputMaybe<NftMetadataInput>>;
}>;


export type GetNftMetadataQuery = { __typename?: 'Query', getNFTMetadataBatch?: { __typename?: 'NFTs', ownedNfts: Array<{ __typename?: 'NFT', title?: string | null, description?: string | null, error?: string | null, contract?: { __typename?: 'Contract', address?: string | null } | null, id?: { __typename?: 'Id', tokenId?: string | null } | null, media: Array<{ __typename?: 'NFTMedia', raw?: string | null, thumbnail?: string | null }>, metadata?: { __typename?: 'NFTMetadata', properties?: Array<{ __typename?: 'NFTProperty', name?: string | null, value?: string | null, display?: string | null } | null> | null } | null, contractMetadata?: { __typename?: 'ContractMetadata', name?: string | null, tokenType?: TokenType | null } | null, chain?: { __typename?: 'Chain', chain?: string | null, network?: string | null } | null }> } | null };


export const GetProfileDocument = gql`
    query getProfile($targetAccountURN: URN) {
  profile(targetAccountURN: $targetAccountURN) {
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
    cover
    location
    job
    bio
    website
  }
  links(targetAccountURN: $targetAccountURN) {
    name
    url
    verified
    provider
  }
  connectedAddresses(targetAccountURN: $targetAccountURN) {
    baseUrn
    qc
    rc
  }
  gallery(targetAccountURN: $targetAccountURN) {
    contract
    tokenId
    chain
  }
}
    `;
export const GetConnectedAddressesDocument = gql`
    query getConnectedAddresses($targetAccountURN: URN) {
  addresses: connectedAddresses(targetAccountURN: $targetAccountURN) {
    baseUrn
    qc
    rc
  }
}
    `;
export const GetAuthorizedAppsDocument = gql`
    query getAuthorizedApps {
  authorizedApps {
    clientId
    icon
    title
    timestamp
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
export const DisconnectAddressDocument = gql`
    mutation disconnectAddress($addressURN: URN!) {
  disconnectAddress(addressURN: $addressURN)
}
    `;
export const GetAddressProfileDocument = gql`
    query getAddressProfile($addressURN: URN!) {
  addressProfile(addressURN: $addressURN) {
    type
    urn
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        email
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        screen_name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        id
        name
        avatar_url
        html_url
        followers
        following
        login
        public_gists
        public_repos
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
        email
      }
      ... on OAuthAppleProfile {
        name
        picture
      }
      ... on OAuthDiscordProfile {
        discordId: id
        email
        username
        discriminator
        avatar
      }
    }
  }
}
    `;
export const GetAddressProfilesDocument = gql`
    query getAddressProfiles($addressURNList: [URN!]) {
  addressProfiles(addressURNList: $addressURNList) {
    type
    urn
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        email
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        screen_name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        id
        name
        avatar_url
        html_url
        followers
        following
        login
        public_gists
        public_repos
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
        email
      }
      ... on OAuthAppleProfile {
        name
        picture
      }
      ... on OAuthDiscordProfile {
        discordId: id
        email
        username
        discriminator
        avatar
      }
    }
  }
}
    `;
export const GetAccountUrnFromAddressDocument = gql`
    query getAccountUrnFromAddress($addressURN: URN!) {
  account(addressURN: $addressURN)
}
    `;
export const UpdateAddressNicknameDocument = gql`
    mutation updateAddressNickname($addressURN: URN!, $nickname: String!) {
  updateAddressNickname(addressURN: $addressURN, nickname: $nickname)
}
    `;
export const UpdateConnectedAddressesPropertiesDocument = gql`
    mutation updateConnectedAddressesProperties($addressURNList: [ConnectedAddressPropertiesUpdateInput!]!) {
  updateConnectedAddressesProperties(addressURNList: $addressURNList)
}
    `;
export const GetAuthorizedAppScopesDocument = gql`
    query getAuthorizedAppScopes($clientId: String!) {
  scopes(clientId: $clientId) {
    permission
    scopes
  }
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
      chain {
        chain
        network
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
      chain {
        chain
        network
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    },
    getConnectedAddresses(variables?: GetConnectedAddressesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConnectedAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConnectedAddressesQuery>(GetConnectedAddressesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getConnectedAddresses', 'query');
    },
    getAuthorizedApps(variables?: GetAuthorizedAppsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAuthorizedAppsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAuthorizedAppsQuery>(GetAuthorizedAppsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAuthorizedApps', 'query');
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
    disconnectAddress(variables: DisconnectAddressMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DisconnectAddressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DisconnectAddressMutation>(DisconnectAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'disconnectAddress', 'mutation');
    },
    getAddressProfile(variables: GetAddressProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfileQuery>(GetAddressProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfile', 'query');
    },
    getAddressProfiles(variables?: GetAddressProfilesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfilesQuery>(GetAddressProfilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfiles', 'query');
    },
    getAccountUrnFromAddress(variables: GetAccountUrnFromAddressQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAccountUrnFromAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAccountUrnFromAddressQuery>(GetAccountUrnFromAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAccountUrnFromAddress', 'query');
    },
    updateAddressNickname(variables: UpdateAddressNicknameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateAddressNicknameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAddressNicknameMutation>(UpdateAddressNicknameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateAddressNickname', 'mutation');
    },
    updateConnectedAddressesProperties(variables: UpdateConnectedAddressesPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateConnectedAddressesPropertiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateConnectedAddressesPropertiesMutation>(UpdateConnectedAddressesPropertiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateConnectedAddressesProperties', 'mutation');
    },
    getAuthorizedAppScopes(variables: GetAuthorizedAppScopesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAuthorizedAppScopesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAuthorizedAppScopesQuery>(GetAuthorizedAppScopesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAuthorizedAppScopes', 'query');
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