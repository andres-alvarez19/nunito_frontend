module.exports = {
  root: true,
  // Use the React Native config included in devDependencies. Keep rules minimal
  // so pre-commit linting runs without causing unrelated failures.
  extends: ['@react-native'],
  rules: {
    // Allow softer rules during this migration; teams can tighten later.
  },
};
