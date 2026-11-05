import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    name: 'overrides',
    files: ['**/*.ts'],
    ignores: ['**/*.js'],
    rules: {
      // TODO remove these overrides and fix the issues:
      '@typescript-eslint/no-explicit-any': 0,
      'import/prefer-default-export': 0,
    },
  },
]
