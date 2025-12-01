import * as path from 'path';
import { X_LANG_HEADER } from '@packages/constants';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';

export const I18nAppModule = I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, 'locales'),
    watch: true,
  },
  resolvers: [new HeaderResolver([X_LANG_HEADER]), AcceptLanguageResolver],
  typesOutputPath: path.join(__dirname, '../src/i18n/i18n.generated.ts'),
});
