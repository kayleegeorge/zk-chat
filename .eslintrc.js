module.exports = {
  extends: ['airbnb-typescript/base',],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  }
};