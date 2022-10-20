/**
 * @file app/shared/utilities/rpc.server.tsx
 */

import invariant from "tiny-invariant";

import {
  redirect,
} from "@remix-run/cloudflare";

// Invariants
// -----------------------------------------------------------------------------

/*
invariant(!OORT_SCHEMA, "OORT_SCHEMA must be defined");
invariant(!OORT_HOST, "OORT_HOST must be defined");
invariant(!OORT_PORT, "OORT_PORT must be defined");
*/

// oortSend
// -----------------------------------------------------------------------------
// This function sends an RPC request to the Kubelt backend (named "oort").

type HeadersObject = {
  // "Access-Control-Allow-Origin": string,
  "Content-Type": string,
  "KBT-Access-JWT-Assertion"?: string,
  "X-Kubelt-Core-Address"?: string,
  "Cookie"?: string,
}

type OortOptions = {
  address?: string;
  jwt?: string;
  cookie?: string;
}

// TODO: REMOVE ADDRESS PARAM
// TODO: ERROR HANDLING
// TODO: PICK WINNER FOR AUTH (JWT OR COOKIE)
export async function oortSend(method: string, params: any[], options: OortOptions) {
  const id = method.replace(/^.+_/,'').replace(/[A-Z]/g, m => "-" + m.toLowerCase());

  const headers: HeadersObject = {
    // "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json;charset=UTF-8",
  }
  if (options.address) {
    headers["X-Kubelt-Core-Address"] = options.address;
  }
  if (options.jwt) {
    headers["KBT-Access-JWT-Assertion"] = options.jwt;
  }
  if (options.cookie) {
    headers["Cookie"] = options.cookie;
  }

  const url = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/jsonrpc`;
  console.log(`URL: ${url}`);

  const request = {
    method: "POST",
    headers,
    body: JSON.stringify({
      id,
      jsonrpc: "2.0",
      method,
      params,
    }),
  };

  //@ts-ignore
  const response = await fetch(url, request);
  const json = await response.json();

  if (response.status !== 200) {
    return {
      status: response.status,
      error: json,
    }
  }

  return json;
}
