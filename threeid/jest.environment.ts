const {readFile} = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
const NodeEnvironment = require('jest-environment-node');
const { getMetamaskWindow } = require('@chainsafe/dappeteer');

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup');

class DappeteerEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    // get the wsEndpoint
    const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8');
    if (!wsEndpoint) throw new Error('wsEndpoint not found');

    // connect to puppeteer
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    });
    this.global.browser = browser;
    this.global.metamask = await getMetamaskWindow(browser);
  }
}

module.exports = DappeteerEnvironment;