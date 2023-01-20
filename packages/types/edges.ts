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
  EdgeURN: any;
  URN: any;
};

export type Edge = {
  __typename?: 'Edge';
  dst: Node;
  id: Scalars['URN'];
  perms: Array<Scalars['String']>;
  src: Node;
  tag: Scalars['EdgeURN'];
};

export type Node = {
  __typename?: 'Node';
  fragment?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['URN']>;
  nid?: Maybe<Scalars['String']>;
  nss?: Maybe<Scalars['String']>;
  qc: Array<Qc>;
  rc: Array<Rc>;
  urn?: Maybe<Scalars['URN']>;
};

export type Qc = {
  __typename?: 'QC';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type Rc = {
  __typename?: 'RC';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};
