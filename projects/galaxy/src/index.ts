import { createServer } from "@graphql-yoga/common";

import schema from "./schema";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  OORT: any;
}

const yoga = createServer<{ env: Env; ctx: ExecutionContext }>({ schema });

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (!env.OORT) {
      throw Error("OORT not set");
    }
    return yoga.handleRequest(request, { env, ctx });
  },
};
