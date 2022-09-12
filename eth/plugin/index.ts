// eth/invite/plugin/index.ts

import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";

import { InviteRuntimeField } from "./InviteRuntimeField";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

// Plugin
// -----------------------------------------------------------------------------
// Inject stuff into the Hardhat Runtime Environment.

// We apply our default config here. Any other kind of config resolution
// or normalization should be placed here.
//
// `config` is the resolved config, which will be used during runtime and
// you should modify.
// `userConfig` is the config as provided by the user. You should not modify
// it.
//
// If you extended the `HardhatConfig` type, you need to make sure that
// executing this function ensures that the `config` object is in a valid
// state for its type, including its extensions. For example, you may
// need to apply a default value, like in this example.
extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  /*
  const userPath = userConfig.paths?.newPath;

  let newPath: string;
  if (userPath === undefined) {
    newPath = path.join(config.paths.root, "newPath");
  } else {
    if (path.isAbsolute(userPath)) {
      newPath = userPath;
    } else {
      // We resolve relative paths starting from the project's root.
      // Please keep this convention to avoid confusion.
      newPath = path.normalize(path.join(config.paths.root, userPath));
    }
  }

  config.paths.newPath = newPath;
  */
});

extendEnvironment(async (hre) => {
  const contract = await hre.run("config:contract");

  //hre.invite = await hre.ethers.getContractAt(CONTRACT_NAME, contract);

  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  //hre.invite = lazyObject(() => new InviteRuntimeField());

  hre.invite = lazyObject(async () => InviteRuntimeField.createAsync(hre));
});
