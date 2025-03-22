module.exports = {
  extends: 'stylelint-config-recommended',
  plugins: ['stylelint-prettier'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extends', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
    'prettier/prettier': true,
    'unit-whitelist': ['em', 'rem', 's'],
  },
};
