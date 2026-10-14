import { useEffect, useState } from "react"
import { getApiErrorMessage } from "@/shared/lib"
import { useCheckApiKeyMutation } from "@/entities/organization"
import { apiKeysSchema } from "../model/api-keys.schema"

const DEBOUNCE_MS = 600

export type KeyCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid" }
  | { status: "error"; error: string }

type Result = { pair: string; valid: boolean; error?: string }

// Живая проверка ключа в OZON: после паузы в вводе, когда оба поля заполнены корректно.
// Результат привязан к паре значений — ответ на старый ввод не перетрёт статус нового
export function useKeyCheck(apiKey: string, clientId: string): KeyCheckState {
  const [check] = useCheckApiKeyMutation()
  const [result, setResult] = useState<Result | null>(null)

  const ready = apiKeysSchema.safeParse({ apiKey, clientId }).success
  const pair = ready ? `${clientId.trim()}|${apiKey.trim()}` : null

  useEffect(() => {
    if (!pair) return
    const [cId, key] = pair.split("|")
    const timer = setTimeout(async () => {
      try {
        const res = await check({ clientId: cId, apiKey: key }).unwrap()
        setResult({ pair, valid: res.valid, error: res.valid ? undefined : res.error })
      } catch (e) {
        setResult({ pair, valid: false, error: getApiErrorMessage(e, "Не удалось проверить ключ — попробуйте ещё раз") })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [pair, check])

  if (!pair) return { status: "idle" }
  if (result?.pair !== pair) return { status: "checking" }
  return result.valid ? { status: "valid" } : { status: "error", error: result.error ?? "Ключ не прошёл проверку" }
}
