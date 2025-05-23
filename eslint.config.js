import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Plugins
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';

export default tseslint.config(
  // 1. Global ignores
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.turbo/',
      '*.config.js',
      '*.config.ts',
      'public/',
    ],
  },

  // 2. Base JavaScript recommended rules
  js.configs.recommended,

  // 3. TypeScript configs (type-checked + stylistic)
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 4. Main ruleset for your React/TS code
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      promise: promisePlugin,
    },

    settings: {
      react: { version: 'detect' },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.eslint.json'],
        },
        node: true,
      },
    },

    rules: {
      // --- TypeScript core ---
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // --- React & Hooks & Refresh ---
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // --- Accessibility ---
      ...jsxA11yPlugin.configs.recommended.rules,

      // --- Imports & circular deps ---
      'import/no-unused-modules': ['warn'],
      'import/no-cycle': ['error', { maxDepth: 5, ignoreExternal: true }],
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '~/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- Promises ---
      ...promisePlugin.configs.recommended.rules,
      'promise/always-return': 'warn',
      'promise/catch-or-return': 'warn',

      // --- Clean-code helpers ---
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always'],
      'no-else-return': ['warn', { allowElseIf: false }],
      curly: ['warn', 'multi-line'],

      // Turn off rules covered by TS
      'no-undef': 'off',
    },
  },

  // 5. Relaxed settings for config files
  {
    files: ['*.config.{js,cjs,mjs,ts,cts,mts}', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly',
        __dirname: 'readonly',
        'import.meta': 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-commonjs': 'off',
      'no-console': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  }
);
