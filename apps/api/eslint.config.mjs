// @ts-check
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import baseConfig from '../../eslint.config.mjs';

/**
 * Configuración de ESLint para la app NestJS
 * Extiende la configuración base del monorepo
 */
export default defineConfig([
  ...baseConfig,
  {
    ignores: ['eslint.config.mjs'],
  },
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Reglas específicas de NestJS
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
]);
