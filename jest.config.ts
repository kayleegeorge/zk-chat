import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  'silent': true,
  'detectOpenHandles': true,
  'testTimeout': 60000,
  'collectCoverage': true,
  'forceExit': true,
  'moduleDirectories': ['node_modules', 'src'],
}
export default config