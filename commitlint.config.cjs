module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow uppercase type tokens used by the team (FEAT, FIX, CHRO) and
    // also allow the standard lowercase conventional types.
    'type-enum': [
      2,
      'always',
      [
        'FEAT',
        'FIX',
        'CHRO',
        'feat',
        'fix',
        'chore',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'revert'
      ]
    ],
    // Disable case enforcement so both UPPERCASE and lowercase are accepted.
    'type-case': [0]
  }
};
