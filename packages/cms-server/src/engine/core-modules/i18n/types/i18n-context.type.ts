import { type APP_LOCALES } from 'cms-shared/translations';
export type I18nContext = {
  req: {
    locale: keyof typeof APP_LOCALES;
  };
};
