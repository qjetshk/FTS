"use client"

import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { useUpdateCountryMutation } from "@/entities/product"

type Props = {
  productId: number
  clientId: number
  countriesOfOrigin: string[]
  currentCountry: string | null
}

export function CountrySelect({ productId, clientId, countriesOfOrigin, currentCountry }: Props) {
  const [updateCountry, { isLoading }] = useUpdateCountryMutation()

  const options = countriesOfOrigin.length > 0 ? countriesOfOrigin : []

  const handleChange = async (country: string) => {
    try {
      await updateCountry({ productId, clientId, country }).unwrap()
    } catch {
      toast.error("Не удалось сохранить страну")
    }
  }

  return (
    <Select value={currentCountry ?? ""} onValueChange={handleChange} disabled={isLoading}>
      <SelectTrigger className="h-7 text-xs min-w-[100px]">
        <SelectValue placeholder="Выбрать..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((c) => (
          <SelectItem key={c} value={c} className="text-xs">
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
