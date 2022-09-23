import { 
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect 
} from "@remix-run/cloudflare";

// import eventSubmit from "~/utils/datadog.server";

type OortJwt = {
  aud: string[];
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  capabilities: object;
}

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

export async function createUserSession(
    jwt: string,
    redirectTo: string,
    address?: string // NOTE: storing this temporarily in the session util RPC url remove address
  ) {
    const parsedJWT = parseJwt(jwt);
    const session = await storage.getSession();
    session.set("core", parsedJWT.iss)
    session.set("jwt", jwt);
    session.set("address", address);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, renew: boolean = true) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function destroyUserSession(session: Session) {
  return redirect("/auth", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function requireJWT(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
  ]);

  if (!jwt || typeof jwt !== "string") {
    throw redirect(`/auth?${searchParams}`);
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt);
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyUserSession(session)
    }
  }
  
  // eventSubmit("3ID user event", `request:${request.url}`, session.get("core"))

  return jwt;
}

export function parseJwt (token: string): OortJwt {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};