import { 
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect 
} from "@remix-run/cloudflare";

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
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: true,
    path: "/",
    maxAge: 60 * 60,
    // httpOnly: true,
  },
});

export async function createUserSession(
    jwt: string,
    redirectTo: string
  ) {
    const session = await storage.getSession();
    session.set("jwt", jwt);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function destroyUserSession(session: Session) {
  return redirect("/auth", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });}

