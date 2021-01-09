module.exports = {
  extends: ['@commitlint/config-conventional'],
  'scope-enum': [
    2,
    'always',
    ['core', 'auth', 'heating', 'product'],
  ]
};
