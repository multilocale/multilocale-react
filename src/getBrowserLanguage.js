/* Copyright 2013 - 2022 Waiterio LLC */

export default function getBrowserLanguage() {
  let language

  if (typeof window !== 'undefined') {
    language = window?.navigator?.languages?.[0]

    if (!language || !language.length) {
      language = window?.navigator?.language || window?.navigator?.userLanguage
    }

    if (language === 'fil') {
      language = 'tl'
    }

    if (language && language.length >= 2) {
      language = language.substring(0, 2)
    }

    if (language === 'in') {
      language = 'id'
    } else if (language === 'ji') {
      language = 'yi'
    } else if (language === 'jw') {
      language = 'jv'
    } else if (language === 'iw') {
      language = 'he'
    } else if (language === 'nb' || language === 'nn') {
      language = 'no'
    }
  }

  return language
}
