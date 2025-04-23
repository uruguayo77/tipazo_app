import { I18n } from 'i18n-js';
import es from './translations/es';

// Create i18n instance
const i18n = new I18n({
  es
});

// Set default locale to Spanish
i18n.locale = 'es';
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export { i18n as I18n };