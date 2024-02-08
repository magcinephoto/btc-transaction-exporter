module.exports = {
  env: { 'browser' : true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'vite.config.ts',
    'dist/**/*.js',
    'dist/**/*.ts',
  ],
  root: true,
};
