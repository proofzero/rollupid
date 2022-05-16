// test/api-v1.js
//
// Test the JavaScript API of the Kubelt Id3.
//
// We use node-tap for testing. See the documentation for available test
// assertions and other information.
// > https://node-tap.org/docs/

const fs = require('fs');
const tap = require('tap');
const kbt = require('../');

// Called before every subsequent descendent test.
/*
tap.beforeEach((t) => {
    // Instantiate the id3.
    t.context.id3 = kbt.v1.init();
});
*/

/*
tap.afterEach((t) => {
});
*/

// Called when t.end() is called or when plan is met. Can return a
// promise to perform async actions.
/*
tap.teardown(() => {
    console.log("after");
});
*/

// TODO re-use tests for id3-js
