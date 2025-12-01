import path from 'path';
import { defineConfig } from 'i18next-cli';

const i18nPath = path.resolve(__dirname, 'src/shared/i18n');

export default defineConfig({
  locales: ['en', 'ru'],
  extract: {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    output: `${i18nPath}/locales/{{language}}/{{namespace}}.json`,
    defaultNS: 'borsell-finance',
    primaryLanguage: 'ru',
    secondaryLanguages: ['en'],
    ignore: ['node_modules/**'],
  },
  types: {
    input: [`${i18nPath}/locales/en/common.json`],
    output: `${i18nPath}/types/i18next.d.ts`,
  },
});
