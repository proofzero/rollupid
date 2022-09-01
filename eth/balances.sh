#!/usr/bin/env bash
set -ex
npx hardhat account:balance --account owner     --network goerli
npx hardhat account:balance --account operator  --network goerli

npx hardhat account:balance --account owner     --network rinkeby
npx hardhat account:balance --account operator  --network rinkeby

npx hardhat account:balance --account owner     --network mumbai
npx hardhat account:balance --account operator  --network mumbai

npx hardhat account:balance --account owner     --network mainnet
npx hardhat account:balance --account operator  --network mainnet

