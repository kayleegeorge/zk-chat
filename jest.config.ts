export default {
  'moduleNameMapper': {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  'transform': {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        'useESM': true,
      },
    ],
  },
  // from https://stackoverflow.com/a/57916712/15076557
  transformIgnorePatterns: [
    //'node_modules/(?!(module-that-needs-to-be-transformed)/)' // add packages that are giving import/export errors here
  ],
}