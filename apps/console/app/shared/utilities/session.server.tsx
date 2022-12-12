/**
 * @file app/shared/utilities/session.server.tsx
 */

import invariant from "tiny-invariant";

import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect,
} from "@remix-run/cloudflare";

// @ts-ignore
invariant(DEPLOY_ENV, "DEPLOY_ENV must be set");

// NB: This secret is set using: wrangler secret put.
// @ts-ignore
invariant(SESSION_SECRET, "SESSION_SECRET must be set");

// @ts-ignore
invariant(SESSION_NAME, "SESSION_NAME must be set");

// Definitions
// -----------------------------------------------------------------------------

const MAX_AGE = 60 * 60 * 4;

// createCookieSessionStorage
// -----------------------------------------------------------------------------
// TODO load the SESSION_SECRET from context injected into Loader and
// use that to construct a Singleton for the session storage.
//
// TODO switch to using a CloudflareKVSessionStorage.

/**
 *
 */
const storage = createCookieSessionStorage({
  cookie: {
    name: SESSION_NAME,
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: DEPLOY_ENV === "current" || "production",
    secrets: [SESSION_SECRET],
    sameSite: true,
    path: "/",
    maxAge: MAX_AGE,
    // httpOnly: true,
  },
});

// redirectTo
// -----------------------------------------------------------------------------

/**
 *
 */
export async function redirectTo(
  target: string,
  session,
  remember?: boolean = true,
) {
  return redirect(target, {
    headers: {
      "Set-Cookie": await storage.commitSession(session, {
        maxAge: remember ? MAX_AGE : undefined,
      }),
    },
  });
}

// createSession
// -----------------------------------------------------------------------------

/**
 *
 */
export async function createSession(
    jwt: string,
    target: string,
    // NOTE: storing this temporarily in the session util RPC url remove address
    address?: string,
    remember?: boolean = true,
) {
  const parsedJWT = parseJWT(jwt);
  const session = await storage.getSession();
  session.set("core", parsedJWT.iss);
  session.set("jwt", jwt);
  session.set("address", address);

  return redirectTo(target, session, remember);
}

// getSession
// -----------------------------------------------------------------------------

/**
 * @todo reset cookie maxAge if valid
 */
export function getSession(request: Request, renew: boolean = true) {
  // TODO can headers be optional here?
  return storage.getSession(request?.headers.get("Cookie"));
}

// destroySession
// -----------------------------------------------------------------------------

/**
 *
 */
export async function destroySession(session: Session) {
  return redirect("/auth", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

// logout
// -----------------------------------------------------------------------------

/**
 *
 */
export async function logout(request: Request) {
  const session = getSession(request);
  return destroySession(session);
}

// requireJWT
// -----------------------------------------------------------------------------

/**
 * @return an encoded JWT
 */
export async function requireJWT(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getSession(request);
  const jwt = session.get("jwt");
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
  ]);

  if (!jwt || typeof jwt !== "string") {
    throw redirect(`/auth?${searchParams}`);
  }
  if (jwt) {
    const parsedJWT = parseJWT(jwt);
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyUserSession(session)
    }
  }

  // eventSubmit("3ID user event", `request:${request.url}`, session.get("core"))

  return jwt;
}

// parseJwt
// -----------------------------------------------------------------------------

type OortJWT = {
  aud: string[];
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  capabilities: object;
}

/**
 *
 */
export function parseJWT (token: string): OortJWT {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};
