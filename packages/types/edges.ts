import { z } from 'zod'
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
  URNComp: any;
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
  qc?: Maybe<Scalars['URNComp']>;
  rc?: Maybe<Scalars['URNComp']>;
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


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function EdgeSchema(): z.ZodObject<Properties<Edge>> {
  return z.object<Properties<Edge>>({
    __typename: z.literal('Edge').optional(),
    dst: NodeSchema(),
    id: definedNonNullAnySchema,
    perms: z.array(z.string()),
    src: NodeSchema(),
    tag: definedNonNullAnySchema
  })
}

export function NodeSchema(): z.ZodObject<Properties<Node>> {
  return z.object<Properties<Node>>({
    __typename: z.literal('Node').optional(),
    fragment: z.string().nullish(),
    id: definedNonNullAnySchema.nullish(),
    nid: z.string().nullish(),
    nss: z.string().nullish(),
    qc: z.record(z.string()).or(z.boolean()).nullish(),
    rc: z.record(z.string()).or(z.boolean()).nullish(),
    urn: definedNonNullAnySchema.nullish()
  })
}

export function QcSchema(): z.ZodObject<Properties<Qc>> {
  return z.object<Properties<Qc>>({
    __typename: z.literal('QC').optional(),
    key: z.string().nullish(),
    value: z.string().nullish()
  })
}

export function RcSchema(): z.ZodObject<Properties<Rc>> {
  return z.object<Properties<Rc>>({
    __typename: z.literal('RC').optional(),
    key: z.string().nullish(),
    value: z.string().nullish()
  })
}
