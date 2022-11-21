import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePaths: [
    "<rootDir>/"
  ]
};
export default config;