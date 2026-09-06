import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...eslint.configs.recommended,
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.ts', 'test/**/*.ts', '*.config.ts'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.ts', 'test/**/*.ts', '*.config.ts'],
  })),
  {
    files: ['src/**/*.ts', 'test/**/*.ts', '*.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
