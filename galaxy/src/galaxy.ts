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

export type Query = {
  __typename?: 'Query';
  address?: Maybe<ThreeIdAddress>;
  addresses?: Maybe<Array<Maybe<ThreeIdAddress>>>;
  profile?: Maybe<ThreeIdProfile>;
  profileFromAddress?: Maybe<ThreeIdProfile>;
};


export type QueryAddressArgs = {
  address: Scalars['String'];
};


export type QueryProfileArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryProfileFromAddressArgs = {
  address: Scalars['String'];
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

export type ThreeIdProfile = {
  __typename?: 'ThreeIDProfile';
  addresses?: Maybe<Array<ThreeIdAddress>>;
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  job?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
};

export type ThreeIdProfileInput = {
  avatar?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  job?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
};

export enum Visibility {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'ThreeIDProfile', displayName?: string | null } | null };


export const GetProfileDocument = gql`
    query getProfile {
  profile {
    displayName
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;