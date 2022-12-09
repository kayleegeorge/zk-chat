require("@nomiclabs/hardhat-ethers")
require("@nomicfoundation/hardhat-chai-matchers")

require('dotenv').config()
const {GOERLI_URL,PRIVATE_KEY} = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
  // defaultNetwork: "goerli",
  networks: {
    hardhat: {
    },
    // goerli: {
    //   url: GOERLI_URL,
    //   accounts: [`${PRIVATE_KEY}`]
    // }
  },
  solidity: {
    version: "0.8.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./src/rln/contracts",
    tests: "./src/rln/test",
  }
}
