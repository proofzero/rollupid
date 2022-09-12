#!/usr/bin/env bash
set -ex
npx hardhat profile:deploy
npx hardhat profile:next
npx hardhat profile:mint --account 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52
npx hardhat profile:owner --profile-id 0
npx hardhat profile:image --profile-id 0
npx hardhat profile:metadata --profile-id 0
npx hardhat profile:destroy --account operator
npx hardhat profile:next # This should now fail.
