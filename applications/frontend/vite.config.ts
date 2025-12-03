/// <reference types="vitest/config" />

// https://vitejs.dev/config/
import { fileURLToPath } from 'node:url';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const src = path.resolve(dirname, 'src');

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@app': path.resolve(src, 'app'),
      '@pages': path.resolve(src, 'pages'),
      '@widgets': path.resolve(src, 'widgets'),
      '@features': path.resolve(src, 'features'),
      '@entities': path.resolve(src, 'entities'),
      '@shared': path.resolve(src, 'shared'),
    },
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
});
