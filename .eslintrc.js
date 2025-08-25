module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        webextensions: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    globals: {
        chrome: 'readonly',
        browser: 'readonly'
    },
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off'
    }
};