/**
 * @file cfw/starbase/build.js
 *
 * Invoke esbuild to transpile our worker code into JavaScript for local
 * development.
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
      format: "esm",
      target: "esnext",
      external: ["__STATIC_CONTENT_MANIFEST"],
      conditions: ["worker"],
      entryPoints: [path.join(__dirname, "src", "index.ts")],
      outdir: path.join(__dirname, "dist"),
      outExtension: { ".js": ".mjs" },
    });
  } catch {
    process.exitCode = 1;
  }
};

build();
