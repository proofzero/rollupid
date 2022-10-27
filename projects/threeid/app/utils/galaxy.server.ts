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
};

export type Mutation = {
  __typename?: 'Mutation';
  updateThreeIDAddress?: Maybe<ThreeIdAddress>;
  updateThreeIDProfile?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateThreeIdAddressArgs = {
  address: ThreeIdAddressInput;
  visible?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpdateThreeIdProfileArgs = {
  profile?: InputMaybe<ThreeIdProfileInput>;
  visibility: Visibility;
};

export type Nftpfp = Pfp & {
  __typename?: 'NFTPFP';
  image?: Maybe<Scalars['String']>;
  isToken?: Maybe<Scalars['Boolean']>;
};

export type Pfp = {
  image?: Maybe<Scalars['String']>;
};

export type PfpInput = {
  image: Scalars['String'];
  isToken?: InputMaybe<Scalars['Boolean']>;
};

export type Profile = {
  displayName?: Maybe<Scalars['String']>;
  pfp?: Maybe<Pfp>;
};

export type Query = {
  __typename?: 'Query';
  address?: Maybe<ThreeIdAddress>;
  addresses?: Maybe<Array<Maybe<ThreeIdAddress>>>;
  profile?: Maybe<Profile>;
  profileFromAddress?: Maybe<Profile>;
};


export type QueryAddressArgs = {
  address: Scalars['String'];
};


export type QueryProfileFromAddressArgs = {
  address: Scalars['String'];
};

export type StandardPfp = Pfp & {
  __typename?: 'StandardPFP';
  image?: Maybe<Scalars['String']>;
};

export type ThreeIdAddress = {
  __typename?: 'ThreeIDAddress';
  address: Scalars['String'];
  threeID: Scalars['ID'];
  type: ThreeIdAddressType;
  visibility: Visibility;
};

export type ThreeIdAddressInput = {
  address: Scalars['String'];
  threeID: Scalars['ID'];
  type: ThreeIdAddressType;
  visibility: Visibility;
};

export enum ThreeIdAddressType {
  Email = 'EMAIL',
  Ens = 'ENS',
  Ethereum = 'ETHEREUM'
}

export type ThreeIdProfile = Profile & {
  __typename?: 'ThreeIDProfile';
  addresses?: Maybe<Array<ThreeIdAddress>>;
  bio?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  job?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  pfp?: Maybe<Pfp>;
  website?: Maybe<Scalars['String']>;
};

export type ThreeIdProfileInput = {
  bio?: InputMaybe<Scalars['String']>;
  cover?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  job?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  pfp?: InputMaybe<PfpInput>;
  website?: InputMaybe<Scalars['String']>;
};

export enum Visibility {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'ThreeIDProfile', displayName?: string | null } | null };

export type GetProfileFromAddressQueryVariables = Exact<{
  address: Scalars['String'];
}>;


export type GetProfileFromAddressQuery = { __typename?: 'Query', profileFromAddress?: { __typename?: 'ThreeIDProfile', cover?: string | null, location?: string | null, job?: string | null, bio?: string | null, website?: string | null, displayName?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null };

export type UpdateProfileMutationVariables = Exact<{
  profile?: InputMaybe<ThreeIdProfileInput>;
  visibility: Visibility;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateThreeIDProfile?: boolean | null };


export const GetProfileDocument = gql`
    query getProfile {
  profile {
    displayName
  }
}
    `;
export const GetProfileFromAddressDocument = gql`
    query getProfileFromAddress($address: String!) {
  profileFromAddress(address: $address) {
    displayName
    pfp {
      ... on StandardPFP {
        image
      }
      ... on NFTPFP {
        image
        isToken
      }
    }
    ... on ThreeIDProfile {
      cover
      location
      job
      bio
      website
    }
  }
}
    `;
export const UpdateProfileDocument = gql`
    mutation updateProfile($profile: ThreeIDProfileInput, $visibility: Visibility!) {
  updateThreeIDProfile(profile: $profile, visibility: $visibility)
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    },
    getProfileFromAddress(variables: GetProfileFromAddressQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileFromAddressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileFromAddressQuery>(GetProfileFromAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfileFromAddress', 'query');
    },
    updateProfile(variables: UpdateProfileMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateProfileMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProfileMutation>(UpdateProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateProfile', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;