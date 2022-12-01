/* Copyright 2013 - 2022 Waiterio LLC */
import React, { useState } from 'react'
import getTranslatables from '@multilocale/multilocale-js-client/getTranslatables.js'
import getBrowserLanguage from './getBrowserLanguage.js'

let defaultLanguage
let organizationId
let project
let dictionaries = {}
let loading
let error
let errorCount = 0

export const init = params => {
  let cache = {}
  if (typeof window !== 'undefined' && window.__MULTILOCALE_CACHE__) {
    cache = window.__MULTILOCALE_CACHE__
  }

  defaultLanguage = params.defaultLanguage
  organizationId = params.organizationId
  project = params.project
  dictionaries = params.dictionaries || cache?.dictionaries || {}
}

export const setDictionaries = dictionaries_ => {
  dictionaries = dictionaries_
}

export const initMultilocale = init

let suspender

export const useTranslation = forcedLanguage => {
  let initialLanguage = forcedLanguage || defaultLanguage

  if (!initialLanguage) {
    initialLanguage = getBrowserLanguage()
  }

  const [language, setLanguage] = useState(initialLanguage || 'en')

  if (
    organizationId &&
    project &&
    !suspender &&
    typeof dictionaries[language] === 'undefined' &&
    errorCount < 3
  ) {
    loading = true
    suspender = getTranslatables({
      organizationId,
      language,
      project,
    })
      .then(translatables => {
        if (!dictionaries[language]) {
          dictionaries[language] = {}
        }

        translatables.forEach(translatable => {
          if (!dictionaries[translatable.language]) {
            dictionaries[translatable.language] = {}
          }
          dictionaries[translatable.language][translatable.key] =
            translatable.value
        })
        suspender = null
        loading = false
      })
      .catch(error_ => {
        console.error(error_)
        error = error_
        errorCount += 1
        suspender = null
        loading = false
      })
  }

  if (loading) {
    throw suspender
  } else if (error && errorCount < 3) {
    throw error
  } else {
    const translate = (key, fallback) => {
      let value = ''

      if (dictionaries?.[language]?.[key]) {
        value = dictionaries[language][key]
      } else if (fallback?.length >= 0) {
        value = fallback
      } else if (!(key.startsWith('__') && key.endsWith('__'))) {
        value = key
      }

      return value
    }

    const Cache = () => {
      const windowVariables = `window.__MULTILOCALE_CACHE__ = ${JSON.stringify({
        dictionaries: {
          [language]: dictionaries[language],
        },
      })};`
      return <script dangerouslySetInnerHTML={{ __html: windowVariables }} />
    }

    return {
      language,
      setLanguage,
      t: translate,
      translate,
      Cache,
      MultilocaleCache: Cache,
    }
  }
}

export default useTranslation
