// const path = require("path")

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   rootDir: ".",
//   transform: {
//     "^.+\\.ts?$": "ts-jest" 
//   },
//   transformIgnorePatterns: ['^.+\\.js$'],
//   modulePaths: [
//     "<rootDir>/src", "<rootDir>/node_modules"
//   ],
//   moduleDirectories: [
//     "src", "node_modules"
//   ],
//   verbose: true,
//   moduleNameMapper: {
//     "/src/(.*)": "<rootDir>/src/$1",
//   },
//   testPathIgnorePatterns: ["<rootDir>/node_modules/"]
// }  
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  "transform": {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
};
export default config;
