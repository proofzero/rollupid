import { createCookieSessionStorage, redirect } from "@remix-run/cloudflare";

const sessionSecret = process.env.SESSION_SECRET;
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
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    // httpOnly: true,
  },
});

export async function createUserSession(
    userId: string,
    redirectTo: string
  ) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}
