import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from "./locales/translations_en.json";
import de from "./locales/translations_de.json";

i18n.use(initReactI18next).init({
    resources: {
        de: { translation: de },
        en: { translation: en }
    },
    lng: 'de',
    fallbackLng: 'en'
});
