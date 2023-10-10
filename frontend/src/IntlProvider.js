// src/IntlProvider.js

import React, { useState, useEffect, createContext, useContext } from 'react';
import koMessages from './langs/ko.json';
import enMessages from './langs/en.json';

const messages = {
  'ko': koMessages,
  'en': enMessages,
};

export const LanguageContext = createContext();

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'locale';

function getBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage;
  return language.split('-')[0];
}

const IntlProvider = ({ children }) => {
  const browserLanguage = getBrowserLanguage();
  const [locale, setLocale] = useState(() => {
    const savedLocale = localStorage.getItem(STORAGE_KEY);
    return savedLocale || browserLanguage || DEFAULT_LANGUAGE;  // 저장된 locale, 브라우저의 언어, 또는 기본 언어를 사용합니다.
  });

  useEffect(() => {
    if (locale === 'auto') {
      localStorage.setItem(STORAGE_KEY, 'auto');  // 'auto' 설정을 localStorage에 저장합니다.
    } else {
      const currentLocale = locale;
      localStorage.setItem(STORAGE_KEY, currentLocale);  // 현재 locale을 localStorage에 저장합니다.
      setLocale(messages[currentLocale] ? currentLocale : DEFAULT_LANGUAGE);  // 지원되는 언어인지 확인하고, 그렇지 않으면 기본 언어를 사용합니다.
    }
  }, [locale]);

  const contextValue = {
    locale,
    messages: messages[locale] || messages[DEFAULT_LANGUAGE],
    setLocale,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export default IntlProvider;
