/**
 * @file starbase/lib/openrpc/build.js
 *
 * Invoke esbuild to transpile library code into JavaScript for local
 * development and testing.
 */

const path = require("path");
const process = require("process");
const url = require("url");
const es = require("esbuild");

//const __filename = url.fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const build = async () => {
  try {
    await es.build({
      bundle: true,
      sourcemap: true,
      platform: "node",
      format: "cjs",
      target: "esnext",
      external: ["__STATIC_CONTENT_MANIFEST"],
      entryPoints: [
        path.join(__dirname, "index.ts"),
      ],
      outdir: path.join(__dirname, "dist"),
      outExtension: { ".js": ".mjs" },
    });
  } catch {
    process.exitCode = 1;
  }
};

build();
