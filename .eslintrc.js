module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'prettier/prettier': 'warn',
    'no-unused-vars': 'warn',
    'spaced-comment': 'warn'
  }
}
