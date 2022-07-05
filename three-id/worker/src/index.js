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

// The manifest is generated as part of the deployment process and
// should not be checked in.
import ASSET_MANIFEST from "./asset-manifest.json";

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
// If we needed to rewrite the URL for some reason, we would then
// create a modified request:
//   const modifiedRequest = new Request(url.toString(), request);
//
// Another possible approach would be to use the mapRequestToAsset
// option to getAssetFromKV.
//
// import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
// ...
// const customKeyModifier = request => {
//   let url = request.url;
//   //custom key mapping optional
//   url = url.replace('/docs', '').replace(/^\/+/, '');
//   return mapRequestToAsset(new Request(url, request));
// }
// let asset = await getAssetFromKV(event, { mapRequestToAsset: customKeyModifier });

export default {
  async fetch(request, env, ctx) {
    if (env["ENVIRONMENT"] === "development") {
      // Development-specific code.
    } else if (env["ENVIRONMENT"] === "next") {
      // Staging-specific code.
    } else if (env["ENVIRONMENT"] === "current") {
      // Production-specific code.
    }

    // Parse the incoming request URL so that we can inspect the
    // hostname and path.
    let url = new URL(request.url);

    // We'll inevitably need to block some domains.
    if (BLOCKED_HOSTNAMES.includes(url.hostname)) {
      return new Response("Blocked Host", { status: 403 });
    }

    // The namespace of the KV store that we want to serve files from.
    const namespace = env.APP;
    // The manifest of files stored in the KV store.
    const manifest = ASSET_MANIFEST;

    const response = await serveAssetFrom(namespace, manifest, request, ctx);

    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  }
};
