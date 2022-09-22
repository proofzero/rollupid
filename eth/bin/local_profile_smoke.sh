#!/usr/bin/env bash
set -ex
npx hardhat profile:deploy
npx hardhat profile:next
npx hardhat profile:mint --account account5
npx hardhat profile:owner --profile-id 0
npx hardhat profile:image --profile-id 0
npx hardhat profile:metadata --profile-id 0
npx hardhat profile:destroy --account operator
npx hardhat profile:next || echo "Expected: Error in plugin hardhat-ethers: 0x5FbDB2315678afecb367f032d93F642f64180aa3 is not a contract account."
