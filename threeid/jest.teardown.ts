const os = require('os');
const path = require('path');
const rimraf = require('rimraf');

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup');

module.exports = async function () {
  // close the browser instance
  await global.browser.close();

  // clean-up the wsEndpoint file
  rimraf.sync(DIR);
};