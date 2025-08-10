export type QrPayload = {
  userId: string
  code: string
  nonce: string
  ts: number
}

export function parseQrPayload(input: string): QrPayload | null {
  const raw = input.trim()

  // JSON directo
  try {
    const obj = JSON.parse(raw)
    if (isValid(obj)) return normalize(obj)
  } catch {
    // ignore
  }

  // URL con ?payload=...
  try {
    const url = new URL(raw)
    const p =
      url.searchParams.get("payload") ||
      url.searchParams.get("p") ||
      url.searchParams.get("data") ||
      url.searchParams.get("d")
    if (p) {
      try {
        const decoded = decodeURIComponent(p)
        const obj = JSON.parse(decoded)
        if (isValid(obj)) return normalize(obj)
      } catch {
        try {
          const json = atob(p)
          const obj = JSON.parse(json)
          if (isValid(obj)) return normalize(obj)
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }

  // Base64 de JSON
  try {
    const json = atob(raw)
    const obj = JSON.parse(json)
    if (isValid(obj)) return normalize(obj)
  } catch {
    // ignore
  }

  return null
}

function isValid(o: any) {
  return (
    o &&
    typeof o.userId === "string" &&
    typeof o.code === "string" &&
    typeof o.nonce === "string" &&
    (typeof o.ts === "number" || typeof o.ts === "string")
  )
}
function normalize(o: any): QrPayload {
  return {
    userId: String(o.userId),
    code: String(o.code),
    nonce: String(o.nonce),
    ts: typeof o.ts === "string" ? Number(o.ts) : o.ts,
  }
}
