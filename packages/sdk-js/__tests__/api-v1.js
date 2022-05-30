// test/api-v1.js
//
// Test the JavaScript API of the Kubelt SDK.
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
    // Instantiate the SDK.
    t.context.sdk = kbt.v1.init();
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

tap.test('SDK v1 has expected API', (t) => {
    const check = (k, a, p) => {
        let o = k;
        let name = ['kbt'];
        a.forEach((elt, idx, arr) => {
            if (o.hasOwnProperty(elt)) {
                o = o[elt];
                name.push(elt);
            } else {
                const msg = name.join('.');
                t.fail(`missing property {msg}`);
            };
        });
        t.ok(o.hasOwnProperty(p));

        name.push(p);
        console.log('SDK has ' + name.join('.'));
    };

    check(kbt, [], 'v1');
    check(kbt, ['v1'], 'init');
    check(kbt, ['v1'], 'halt');
    check(kbt, ['v1'], 'options');
    check(kbt, ['v1', 'core'], 'authenticate');

    t.end();
});

tap.test('sdk init', (t) => {
    const isPromise = (o) => {
        const isObject = ('object' == typeof(o));
        const isThenable = ('function' == typeof(o.then));
        return isObject && isThenable;
    };

    tap.test('returns a promise', (t) => {
        const p = kbt.v1.init();
        t.ok(isPromise(p));
        return p;
    });

    tap.test('without config', (t) => {
        return kbt.v1.init()
            .then((sdk) => {
                t.type(sdk, 'object');
                return kbt.v1.halt(sdk);
            }).then(() => {
                t.pass('ok');
            });
    });

    tap.test('with empty config', (t) => {
        return kbt.v1.init({})
            .then((sdk) => {
                t.type(sdk, 'object');
                return kbt.v1.halt(sdk);
            }).then(() => {
                t.pass('ok');
            });
    });

    tap.test('with valid config', (t) => {
        return kbt.v1.init({
            "log/level": "info",
        }).then((sdk) => {
            t.type(sdk, 'object');
            return kbt.v1.halt(sdk);
        }).then(() => {
            t.pass('ok');
        });
    });

    t.end();
});

/*
tap.test('account authenticate', (t) => {
    return kbt.v1.init()
        .then((sdk) => {
            const wallet = {
                signFn: (data) => {
                    return "fake";
                },
            };
            kbt.v1.core.authenticate(sdk, wallet);
        });
});
*/
