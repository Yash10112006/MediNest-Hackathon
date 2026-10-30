import { Globe2 } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '../../config/languages'

export default function LanguageSelector({
  value,
  onChange,
}) {
  return (
    <div className="flex items-center gap-2">
      <Globe2 className="h-4 w-4 text-teal-600" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}