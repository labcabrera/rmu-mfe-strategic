import js from '@eslint/js';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Shared by the shared lib, the shell and every MFE: keep the copies identical.
export default [
  { ignores: ['dist/**', 'node_modules/**', 'storybook-static/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      i18next,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',

      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],

      // Every visible string goes through i18n: JSX text and the attributes users see or hear.
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['label', 'title', 'placeholder', 'aria-label', 'helperText', 'alt', 'subtitle', 'text'],
          },
        },
      ],
    },
  },
  {
    // Stories and tests hold sample data, not UI text.
    files: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', 'src/test/**', '.storybook/**'],
    rules: { 'i18next/no-literal-string': 'off' },
  },
];
