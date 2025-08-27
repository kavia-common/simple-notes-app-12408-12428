module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    localStorage: 'readonly',
    confirm: 'readonly',
    navigator: 'readonly',
    requestAnimationFrame: 'readonly',
    setTimeout: 'readonly',
    document: 'readonly',
    window: 'readonly',
  },
  overrides: [
    {
      files: ['src/**/*.js'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        // Keep rules minimal; rely on the top-level eslint.config.mjs for the rest
      },
    },
  ],
};
