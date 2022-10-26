/**
 * @file app/entry.client.tsx
 */

import { RemixBrowser } from "@remix-run/react";

// React 17
/*
import { hydrate } from "react-dom";
hydrate(<RemixBrowser />, document);
*/

// React 18
import { hydrateRoot } from "react-dom/client";
hydrateRoot(document, <RemixBrowser />);
