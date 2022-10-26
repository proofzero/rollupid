import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect,
} from "@remix-run/cloudflare";

// import eventSubmit from "~/utils/datadog.server";

type OortJwt = {
  aud: string[];
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  capabilities: object;
};

// @ts-ignore
const sessionSecret = SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "3ID_SESSION",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "current" || "production",
    secrets: [sessionSecret],
    sameSite: true,
    path: "/",
    maxAge: 60 * 60 * 4,
    // httpOnly: true,
  },
});

const nonceStorage = createCookieSessionStorage({
  cookie: {
    name: "3ID_NONCE",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "current" || "production",
    secrets: [sessionSecret],
    sameSite: true,
    path: "/",
    maxAge: 60,
    // httpOnly: true,
  },
});

export async function createNonceSession(nonce: string, redirectTo: string) {
  const session = await nonceStorage.getSession();
  session.set("nonce", nonce);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await nonceStorage.commitSession(session),
    },
  });
}

export async function createUserSession(
  jwt: string,
  redirectTo: string,
  address?: string // NOTE: storing this temporarily in the session util RPC url remove address
) {
  const parsedJWT = parseJwt(jwt);
  const session = await storage.getSession();
  session.set("core", parsedJWT.iss);
  session.set("jwt", jwt);
  session.set("address", address);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getNonceSession(request: Request, renew: boolean = true) {
  return nonceStorage.getSession(request.headers.get("Cookie"));
}

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, renew: boolean = true) {
  return storage.getSession(request.headers.get("Cookie"));
}

export function parseJwt(token: string): OortJwt {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
