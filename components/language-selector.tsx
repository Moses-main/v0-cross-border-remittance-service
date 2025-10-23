"use client"

import { useI18n, type LanguageCode } from "./language-provider"

export function LanguageSelector() {
  const { lang, setLang } = useI18n()
  return (
    <select
      aria-label="Language"
      className="bg-transparent border border-border rounded-md text-sm px-2 py-1"
      value={lang}
      onChange={(e) => setLang(e.target.value as LanguageCode)}
    >
      <option value="en">EN</option>
      <option value="fr">FR</option>
      <option value="es">ES</option>
      <option value="de">DE</option>
    </select>
  )
}
