/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Disable syntax checking. See https://kulshekhar.github.io/ts-jest/docs/getting-started/options/diagnostics/
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          exclude: ['!**/*.(spec|test).ts'],
        },
      },
    ],
  },
};
