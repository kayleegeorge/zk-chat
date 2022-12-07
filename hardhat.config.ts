require("@nomiclabs/hardhat-ethers")
import * as dotenv from 'dotenv'

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config()
const {GOERLI_URL,PRIVATE_KEY} = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.15",
  paths: { },
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [`${PRIVATE_KEY}`]
    }
  }
};

export default config;