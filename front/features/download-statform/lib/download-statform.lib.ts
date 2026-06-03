const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200/api"

export async function downloadStatform(id: string, fallbackName = "statform.xml"): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const res = await fetch(`${baseUrl}/statforms/${id}/download`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
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
