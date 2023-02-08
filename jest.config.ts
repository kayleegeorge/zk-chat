import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    "js",
    "jsx",
    "tsx",
    "ts"
  ],
  "rootDir": "tests/",

  "transform": {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
  "silent": true,
  "detectOpenHandles": true,
  "testTimeout": 60000,
  "collectCoverage": true,
  "forceExit": true,
  moduleDirectories: ["node_modules", 'src'],
  moduleNameMapper: {
    '^js-waku/(.*)$': ['<rootDir>/node_modules/$1'],
},
};
export default config;
