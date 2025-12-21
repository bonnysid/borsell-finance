import { initUiKitI18n, UI_KIT_NS } from '@devbonnysid/ui-kit-default';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enUiKit from './locales/en/ui-kit.json';
import enValidation from './locales/en/validation.json';
import ruCommon from './locales/ru/common.json';
import ruUiKit from './locales/ru/ui-kit.json';
import ruValidation from './locales/ru/validation.json';

export const I18N_NS = 'common';
export const I18N_VALIDATION_NS = 'validation';

export const resources = {
  en: { [I18N_NS]: enCommon, [UI_KIT_NS]: enUiKit, [I18N_VALIDATION_NS]: enValidation },
  ru: { [I18N_NS]: ruCommon, [UI_KIT_NS]: ruUiKit, [I18N_VALIDATION_NS]: ruValidation },
} as const;

i18n.use(initReactI18next).init({
  lng: 'ru',
  fallbackLng: 'en',
  ns: [I18N_NS, UI_KIT_NS, I18N_VALIDATION_NS],
  defaultNS: I18N_NS,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

initUiKitI18n(i18n);

export { i18n };
export default i18n;
