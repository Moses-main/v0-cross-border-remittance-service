"use client"

import { useI18n, type LanguageCode } from "./language-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LanguageSelector() {
  const { lang, setLang } = useI18n()
  
  return (
    <Select 
      value={lang} 
      onValueChange={(value: LanguageCode) => setLang(value)}
    >
      <SelectTrigger className="w-[80px] h-9">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="fr">FR</SelectItem>
        <SelectItem value="es">ES</SelectItem>
        <SelectItem value="de">DE</SelectItem>
      </SelectContent>
    </Select>
  )
}
