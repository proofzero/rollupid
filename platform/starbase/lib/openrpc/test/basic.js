/**
 * @module @kubelt/openrpc
 * @file test/basic.js
 */

const fc = require("fast-check");
const t = require("tap");

const openrpc = require("../dist/index");

// Tests
// -----------------------------------------------------------------------------

t.test("example", async t => {
  t.equal(1, 1, "1 = 1");
  fc.assert(fc.property(fc.array(fc.integer()), (data) => {
    // Check that data has expected properties
    t.equal(2, 2);
  }));
});

t.test("context", async t => {
  const ctx = openrpc.context();

  t.equal(0, ctx.size, "a new context should have no entries");

});

t.test("scope", async t => {

  t.test("basic", async t => {
    const name = "example";
    const scope = openrpc.scope(name);
    t.type(scope, "symbol", "scopes are symbols");
    t.equal(name, scope.description, "scope has the expected name");
  });

  t.test("trim", async t => {
    const ws = " example ";
    const scope = openrpc.scope(ws);
    t.type(scope, "symbol", "scopes are symbols");
    t.equal(ws.trim(), scope.description, "whitespace is trimmed from scope names");
  });

});
