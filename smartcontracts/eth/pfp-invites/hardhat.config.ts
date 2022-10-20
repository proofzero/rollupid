/** @type import('hardhat/config').HardhatUserConfig */
import * as config from  './invite.config';

// We probably don't want to use the CLI for profiles
// so we import the invites above as default. You can
// run `npx hardhat --config profile.config.ts` to use
// the profile commands, or, if you're doing a lot of
// profile work, uncomment this and comment the invite
// import above.
//import * as config from  './profile.config';

module.exports = config;
