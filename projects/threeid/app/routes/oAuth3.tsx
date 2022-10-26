import type { 
    LoaderFunction,
    ActionFunction,
    json
} from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({
    request,
  }) => {
    const url = new URL(request.url);
    const identity = url.searchParams.get("identity");
    const claims = url.searchParams.get("claims");
    const appId = url.searchParams.get("appId");
    const redirectUrl = url.searchParams.get("redirectUrl");

    // TODO: call oort to resolve super core

    // TODO: render on client an oauth box
    return json({
        identity,
        claims,
        appId,
        redirectUrl,
    });
  };

  export const action: ActionFunction = async ({
    request,
  }) => {
    // TODO: accept from client accept or deny request
    // TODO: genearte jwt
    // TODO: redirect to app
    
  };

export default function OAuth3 ()  {
    return <div>OAuth3</div>
}