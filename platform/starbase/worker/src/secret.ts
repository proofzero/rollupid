/**
 * @file worker/src/hash.ts
 *
 * Utility hash method for producing a multihash from a string.
 */

import * as hasher from "multiformats/hashes/hasher";

import { CID } from "multiformats/cid";

import type {
  BlockCodec,
} from "multiformats";

import type {
  MultihashDigest,
  MultihashHasher,
} from "multiformats/hashes/interface";

import type {
  ByteView,
} from "multiformats/codecs/interface";

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

/*
const json: BlockCodec<0x0200, string> = {
  name: "json",
  code: 0x0200,
  encode: (json): ByteView<string> => {
    return new TextEncoder().encode(JSON.stringify(json));
  },
  decode: (bytes: ByteView<string>): string => {
    console.log(new TextDecoder().decode(bytes));
    return JSON.parse(new TextDecoder().decode(bytes));
  },
};
*/

// sha256
// -----------------------------------------------------------------------------

// NB: If this workers when deployed on CF, we don't need to bother with
// building our own MultihashHasher below.
import { sha256 } from "multiformats/hashes/sha2";
/*
const sha256: MultihashHasher<0x12> = hasher.from({
  // As per multiformats table
  // https://github.com/multiformats/multicodec/blob/master/table.csv#L9
  name: "sha2-256",
  code: 0x12,
  encode: async (input: Uint8Array): Promise<Uint8Array> => {
    // options: SHA-256, SHA-385, SHA-512
    const algo = "SHA-256";
    const digest = await crypto.subtle.digest(algo, input);
    return new Uint8Array(digest);
  },
});
*/

// hash
// -----------------------------------------------------------------------------

export async function hash(s: string): Promise<string> {
  const bytes = await sha256.digest(json.encode(s));
  const cid = CID.create(1, json.code, bytes);
  return cid.toString();
};

// parse
// -----------------------------------------------------------------------------

export function parse(s: string): CID {
  return CID.parse(s);
};
