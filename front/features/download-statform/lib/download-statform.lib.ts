import { API_URL, getAccessToken, refreshAccessToken } from "@/shared/api"

export async function downloadStatform(id: string, fallbackName = "statform.xml"): Promise<void> {
  const request = () => {
    const token = getAccessToken()
    return fetch(`${API_URL}/statforms/${id}/download`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }
  let res = await request()
  // токен в памяти мог истечь (или его ещё нет после перезагрузки) — обновляем и повторяем
  if (res.status === 401 && (await refreshAccessToken())) res = await request()
  if (!res.ok) throw new Error(`Не удалось скачать файл (${res.status})`)

  const cd = res.headers.get("Content-Disposition") ?? ""
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd)
  const filename = match ? decodeURIComponent(match[1]) : fallbackName

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
