import { useEffect, useRef } from "react"
import { API_URL, getAccessToken, refreshAccessToken } from "./base.api"

export type StreamEvent = { event: string; data: string }

const RECONNECT_MIN_MS = 1_000
const RECONNECT_MAX_MS = 30_000

// SSE поверх fetch: нативный EventSource не умеет заголовок Authorization.
// Сам переподключается с backoff, на 401 обновляет access-токен.
export function useAuthEventStream(path: string, onEvent: (e: StreamEvent) => void, enabled = true) {
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled) return
    const abort = new AbortController()
    let delay = RECONNECT_MIN_MS

    const connect = async (): Promise<void> => {
      while (!abort.signal.aborted) {
        try {
          const token = getAccessToken()
          const res = await fetch(`${API_URL}${path}`, {
            headers: { Accept: "text/event-stream", ...(token && { Authorization: `Bearer ${token}` }) },
            credentials: "include",
            signal: abort.signal,
          })

          if (res.status === 401) {
            if (!(await refreshAccessToken())) await wait(delay, abort.signal)
            continue
          }
          if (!res.ok || !res.body) throw new Error(`SSE ${res.status}`)

          delay = RECONNECT_MIN_MS
          await readStream(res.body, (e) => onEventRef.current(e))
        } catch {
          if (abort.signal.aborted) return
        }
        // поток закрылся (рестарт бэка, сеть) — переподключаемся
        await wait(delay, abort.signal)
        delay = Math.min(delay * 2, RECONNECT_MAX_MS)
      }
    }

    void connect()
    return () => abort.abort()
  }, [path, enabled])
}

// разбор text/event-stream: события разделены пустой строкой, поля event:/data:
async function readStream(body: ReadableStream<Uint8Array>, emit: (e: StreamEvent) => void) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split(/\r?\n\r?\n/)
    buffer = chunks.pop() ?? ""
    for (const chunk of chunks) {
      let event = "message"
      const data: string[] = []
      for (const line of chunk.split(/\r?\n/)) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        else if (line.startsWith("data:")) data.push(line.slice(5).trimStart())
      }
      if (data.length) emit({ event, data: data.join("\n") })
    }
  }
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms)
    signal.addEventListener("abort", () => { clearTimeout(id); resolve() }, { once: true })
  })
