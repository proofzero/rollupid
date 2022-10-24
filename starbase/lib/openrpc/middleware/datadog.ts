/**
 * @file src/middleware/datadog.ts
 */

import { middleware } from "..";

// datadog
// -----------------------------------------------------------------------------

/**
 * An extension that injects a Datadog client into the context.
 *
 * @todo add constructor function to inject secrets/config and return
 * this fn.
 */
export default middleware(async (request, context) => {
  // TODO
  return context;
});
