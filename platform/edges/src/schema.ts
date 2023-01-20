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
  AccessURN: any;
  AddressURN: any;
  EdgeURN: any;
  ObjectURN: any;
  ProfileURN: any;
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

export enum EdgeDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing'
}

export type EdgeQuery = {
  __typename?: 'EdgeQuery';
  dir?: Maybe<EdgeDirection>;
  dst?: Maybe<Node>;
  id: Scalars['URN'];
  src?: Maybe<Node>;
  tag?: Maybe<Scalars['EdgeURN']>;
};

export type EdgeQueryOptions = {
  __typename?: 'EdgeQueryOptions';
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type GetEdgesInput = {
  options?: InputMaybe<EdgeQueryOptions>;
  query: EdgeQuery;
};

export type GetEdgesResult = {
  __typename?: 'GetEdgesResult';
  edges: Array<Edge>;
  id: Scalars['URN'];
};

export type MakeEdgeInput = {
  dst: Scalars['URN'];
  src: Scalars['URN'];
  tag: Scalars['EdgeURN'];
};

export type MakeEdgeResult = {
  __typename?: 'MakeEdgeResult';
  edge: MakeEdgeInput;
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

export type RemoveEdgeResult = {
  __typename?: 'RemoveEdgeResult';
  remove: Scalars['EdgeURN'];
};

export type RemoveEdge = {
  dst: Scalars['URN'];
  src: Scalars['URN'];
  tag: Scalars['EdgeURN'];
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

export const EdgeDirectionSchema = z.nativeEnum(EdgeDirection);

export function EdgeQuerySchema(): z.ZodObject<Properties<EdgeQuery>> {
  return z.object<Properties<EdgeQuery>>({
    __typename: z.literal('EdgeQuery').optional(),
    dir: EdgeDirectionSchema.nullish(),
    dst: NodeSchema().nullish(),
    id: definedNonNullAnySchema,
    src: NodeSchema().nullish(),
    tag: definedNonNullAnySchema.nullish()
  })
}

export function EdgeQueryOptionsSchema(): z.ZodObject<Properties<EdgeQueryOptions>> {
  return z.object<Properties<EdgeQueryOptions>>({
    __typename: z.literal('EdgeQueryOptions').optional(),
    limit: z.number().nullish(),
    offset: z.number().nullish()
  })
}

export function GetEdgesInputSchema(): z.ZodObject<Properties<GetEdgesInput>> {
  return z.object<Properties<GetEdgesInput>>({
    options: EdgeQueryOptionsSchema().nullish(),
    query: EdgeQuerySchema()
  })
}

export function GetEdgesResultSchema(): z.ZodObject<Properties<GetEdgesResult>> {
  return z.object<Properties<GetEdgesResult>>({
    __typename: z.literal('GetEdgesResult').optional(),
    edges: z.array(EdgeSchema()),
    id: definedNonNullAnySchema
  })
}

export function MakeEdgeInputSchema(): z.ZodObject<Properties<MakeEdgeInput>> {
  return z.object<Properties<MakeEdgeInput>>({
    dst: definedNonNullAnySchema,
    src: definedNonNullAnySchema,
    tag: definedNonNullAnySchema
  })
}

export function MakeEdgeResultSchema(): z.ZodObject<Properties<MakeEdgeResult>> {
  return z.object<Properties<MakeEdgeResult>>({
    __typename: z.literal('MakeEdgeResult').optional(),
    edge: z.lazy(() => MakeEdgeInputSchema())
  })
}

export function NodeSchema(): z.ZodObject<Properties<Node>> {
  return z.object<Properties<Node>>({
    __typename: z.literal('Node').optional(),
    fragment: z.string().nullish(),
    id: definedNonNullAnySchema.nullish(),
    nid: z.string().nullish(),
    nss: z.string().nullish(),
    qc: z.array(QcSchema()),
    rc: z.array(RcSchema()),
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

export function RemoveEdgeResultSchema(): z.ZodObject<Properties<RemoveEdgeResult>> {
  return z.object<Properties<RemoveEdgeResult>>({
    __typename: z.literal('RemoveEdgeResult').optional(),
    remove: definedNonNullAnySchema
  })
}

export function RemoveEdgeSchema(): z.ZodObject<Properties<RemoveEdge>> {
  return z.object<Properties<RemoveEdge>>({
    dst: definedNonNullAnySchema,
    src: definedNonNullAnySchema,
    tag: definedNonNullAnySchema
  })
}
