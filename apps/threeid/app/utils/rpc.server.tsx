import { redirect } from "@remix-run/cloudflare";

type HeadersObject = {
  // "Access-Control-Allow-Origin": string,
  "Content-Type": string;
  "KBT-Access-JWT-Assertion"?: string;
  "KBT-Core-Address"?: string;
};

type OortOptions = {
  address?: string;
  jwt?: string;
};

// @ts-ignore
// const OORT_URL = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/jsonrpc`;
const OORT_URL = "http://127.0.0.1/jsonrpc";

// TODO: REMOVE ADDRESS PARAM
// TODO: ERROR HANDLING
// TODO: PICK WINNER FOR AUTH (JWT OR COOKIE)
export async function oortSend(
  method: string,
  params: any[],
  options: OortOptions
) {
  const id = method
    .replace(/^.+_/, "")
    .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

  const headers: HeadersObject = {
    // "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json;charset=UTF-8",
  };
  if (options.jwt) {
    headers["KBT-Access-JWT-Assertion"] = options.jwt;
  }
  if (options.address) {
    headers["KBT-Core-Address"] = options.address;
  }

  const oortRequest = {
    method: "POST",
    headers,
    body: JSON.stringify({
      id,
      jsonrpc: "2.0",
      method,
      params,
    }),
  };

  console.log("fetching nonce from oort", OORT_URL, oortRequest);

  //@ts-ignore
  const response = await OORT.fetch(OORT_URL, oortRequest);

  try {
    const json = await response.json();

    if (response.status !== 200) {
      console.error("oortSend error", response.status, json);
      return {
        staus: response.status,
        error: json,
      };
    }

    return json;
  } catch (e) {
    console.error("oortSend error", e);
    return {
      status: 500,
      error: e,
    };
  }
}
