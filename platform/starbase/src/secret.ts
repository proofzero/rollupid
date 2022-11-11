// platform/starbase/src/secret.ts

/**
 * Utility for hashing secrets before they're stored as part of an
 * application record.
 */

import { CID } from 'multiformats/cid'

// json
// -----------------------------------------------------------------------------
// A multiformat Block encoder for JSON data.
//
// BlockCodec<Code extends number, T> extends BlockEncoder<Code, T>, BlockDecoder<Code, T>
//
// BlockEncoder<Code extends number, T>
// => encode: (data: T) => ByteView<T>
//
// BlockDecoder<Code extends number, T>
// => decode: (bytes: ByteView<T>) => T

import * as json from 'multiformats/codecs/json'

// sha256
// -----------------------------------------------------------------------------
// NB: This works when deployed on CF, we don't need to bother with
// building our own MultihashHasher.

import { sha256 } from 'multiformats/hashes/sha2'

// hash
// -----------------------------------------------------------------------------

export async function hash(s: string): Promise<string> {
  const bytes = await sha256.digest(json.encode(s))
  const cid = CID.create(1, json.code, bytes)
  return cid.toString()
}

// parse
// -----------------------------------------------------------------------------

export function parse(s: string): CID {
  return CID.parse(s)
}
