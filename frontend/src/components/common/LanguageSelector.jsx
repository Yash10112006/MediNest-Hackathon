// frontend/src/components/common/LanguageSelector.jsx
// Compact, accessible language switcher popover for MediNest

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LanguageSelector({ variant = 'navbar', className = '' }) {
  const { language, setLanguage, languages, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Current language object
  const currentLang = languages.find(l => l.code === language) || languages[0]

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all
          ${variant === 'navbar'
            ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-sm'
          }
        `}
      >
        <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
        <span className="font-semibold">{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
            role="listbox"
          >
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('changeLanguage', 'Change Language')}</span>
            </div>

            <div className="p-1 space-y-0.5">
              {languages.map((langItem) => {
                const isSelected = language === langItem.code
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setLanguage(langItem.code)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition
                      ${isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{langItem.native}</span>
                      {langItem.name !== langItem.native && (
                        <span className="text-[10px] text-slate-400 font-normal">({langItem.name})</span>
                      )}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
