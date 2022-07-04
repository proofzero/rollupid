/**
 * three-id/worker/src/index.js
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
  getAssetFromKV,
  NotFoundError,
  MethodNotAllowedError,
} from "@cloudflare/kv-asset-handler";

// These manifests are generated as part of the deployment process and
// should not be checked in. The "gate" manifest is generated when the
// "gate" application is compiled, while the "site" manifest is
// generated when the web(site) application is compiled.
import gateManifest from "./gate-manifest.json";
import siteManifest from "./site-manifest.json";

// The prefix used to route requests to files stored in the SITE store.
const APP_PREFIX = new RegExp("^/dapp");

// Requests originating in these domains get clobbered.
const BLOCKED_HOSTNAMES = [
  //"miscreants.example.com",
];


const serveAssetFrom = async (namespace, manifest, request, ctx) => {
  try {
    // getAssetFromKV(Evt) => Promise
    //
    // getAssetFromKV is an async function that takes an Evt object
    // (containing a Request and a waitUntil) and returns a Response object
    // if the request matches an asset in KV, otherwise it will throw a
    // KVError. It also serves index.html from '/'.
    //
    // Optional arguments may be provided in a second object argument and
    // include:
    // - mapRequestToAsset
    // - cacheControl
    // - browserTTL
    // - edgeTTL
    // - bypassCache
    // - ASSET_NAMESPACE (required for ES modules)
    // - ASSET_MANIFEST (required for ES modules)
    return await getAssetFromKV(
      {
        request,
        waitUntil(promise) {
          return ctx.waitUntil(promise);
        },
      },
      {
        ASSET_NAMESPACE: namespace,
        ASSET_MANIFEST: manifest,
      }
    );
  } catch (e) {
    if (e instanceof NotFoundError) {
      // TODO serve 404 page?
      return new Response("Not Found", { status: 404 });
    } else if (e instanceof MethodNotAllowedError) {
      // TODO serve error page?
      return new Response("Method Not Allowed", { status: 405 });
    } else {
      // TODO serve ISE page?
      console.log(e);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  }
};

// Entry-point
// -----------------------------------------------------------------------------

export default {
  async fetch(request, env, ctx) {
    if (env["ENVIRONMENT"] === "development") {
      // Development-specific code.
    } else if (env["ENVIRONMENT"] === "next") {
      // Staging-specific code.
      console.log("next");
    } else if (env["ENVIRONMENT"] === "current") {
      // Production-specific code.
      console.log("current");
    }

    // Parse the incoming request URL so that we can inspect the
    // hostname and path.
    let url = new URL(request.url);

    // We'll inevitably need to block some domains.
    if (BLOCKED_HOSTNAMES.includes(url.hostname)) {
      return new Response("Blocked Host", { status: 403 });
    }

    // When a request arrives that begins with the application prefix,
    // we serve up resources from the SITE binding (where the web
    // application lives) rather than the GATE binding (where our front
    // door lives). For example, the request:
    //
    //   GET ${APP_PREFIX}/manifest.json
    //
    // will be rewritten to:
    //
    //   GET /manifest.json
    //
    // and return the value for the key /manifest.json in the SITE
    // store. Any other requests will return a value from the GATE
    // store, if present.

    // The namespace of the KV store that we want to serve files from.
    let namespace;
    // The manifest of files stored in the KV store.
    let manifest;

    if (APP_PREFIX.test(url.pathname)) {
      // Strip off the application prefix.
      url.pathname = url.pathname.replace(APP_PREFIX, "");
      manifest = siteManifest;
      namespace = env.SITE;
    } else {
      manifest = gateManifest;
      namespace = env.GATE;
    }

    const modifiedRequest = new Request(url.toString(), request);

    const response = await serveAssetFrom(namespace, manifest, modifiedRequest, ctx);

    // If request 404s and we were looking it up in the GATE namespace,
    // try looking it up in the SITE namespace as fallback.
    if (404 == response.status && env.GATE == namespace) {
      console.log(`falling back (env.GATE => env.SITE) for ${url.pathname}`);
      return serveAssetFrom(env.SITE, siteManifest, modifiedRequest, ctx);
    } else {
      return response;
    }
  }
};
