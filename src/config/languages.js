export const supportedLanguages = {
  en: {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    googleCode: 'en-US'
  },
  fa: {
    code: 'fa-IR',
    name: 'Persian',
    direction: 'rtl',
    googleCode: 'fa-IR'
  },
  sv: {
    code: 'sv-SE',
    name: 'Swedish',
    direction: 'ltr',
    googleCode: 'sv-SE'
  }
};

export const defaultLanguage = 'en';

export const getLanguageConfig = (langCode) => {
  return supportedLanguages[langCode] || supportedLanguages[defaultLanguage];
};

export const isValidLanguage = (langCode) => {
  return Object.keys(supportedLanguages).includes(langCode);
};

export const getGoogleLanguageCode = (langCode) => {
  const lang = supportedLanguages[langCode];
  return lang ? lang.googleCode : supportedLanguages[defaultLanguage].googleCode;
};
