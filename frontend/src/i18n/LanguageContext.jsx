// frontend/src/i18n/LanguageContext.jsx
// Global Language Context for MediNest

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from './translations'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', ttsCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', ttsCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', ttsCode: 'mr-IN' }
]

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('medinest_language')
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved
      }
    } catch (e) {
      console.error(e)
    }
    return 'en'
  })

  // Set language and persist in localStorage
  const setLanguage = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'hi' || newLang === 'mr') {
      setLanguageState(newLang)
      try {
        localStorage.setItem('medinest_language', newLang)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Translation lookup helper
  const t = useCallback((key, fallback = '') => {
    if (!key) return ''
    const currentDict = translations[language] || translations.en
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key]
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key]
    }
    return fallback || key
  }, [language])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
