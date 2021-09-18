module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  extends: ['plugin:vue/essential', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // 支持ts-ignore
    '@typescript-eslint/ban-ts-ignore': 'off'
  }
};
