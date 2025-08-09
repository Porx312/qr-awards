"use client"

import * as React from "react"
import Image from "next/image"
import { useQuery, useMutation } from "convex/react"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Copy, Download, RefreshCw, AlertTriangle } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { Id } from "@v1/backend/convex/_generated/dataModel"

type Props = {
  // Deja vacío para evitar llamadas inválidas en el primer render
  defaultOwnerUserId?: string
}

// Heurística simple para detectar un Id de Convex (min 10 chars, [a-z0-9], sin espacios)
function isLikelyConvexId(s: string | undefined) {
  if (!s) return false
  if (s.includes(" ")) return false
  if (s.toLowerCase() !== s) return false
  return /^[a-z0-9]{10,}$/.test(s)
}

export default function QrCard({ defaultOwnerUserId = "" }: Props) {
  const [ownerUserId, setOwnerUserId] = React.useState<string>(defaultOwnerUserId)
  const [qrPngDataUrl, setQrPngDataUrl] = React.useState<string>("")
  const [copied, setCopied] = React.useState(false)
  const [pngLoading, setPngLoading] = React.useState(false)
  const [autoGenMsg, setAutoGenMsg] = React.useState<string>("")

  const validOwner = isLikelyConvexId(ownerUserId)

  // Convex
  const qr = useQuery(api.qr.getUserQr, validOwner ? { ownerUserId: ownerUserId as Id<"users"> } : "skip")
  const generateUserQr = useMutation(api.qr.generateUserQr)

  // Auto-generar si no existe (una sola vez por ownerUserId válido)
  const attemptedRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    const autoGenerate = async () => {
      if (!validOwner) return
      if (qr === null && attemptedRef.current !== ownerUserId) {
        attemptedRef.current = ownerUserId
        try {
          await generateUserQr({ ownerUserId: ownerUserId as Id<"users"> })
          setAutoGenMsg("")
        } catch (e: any) {
          setAutoGenMsg(e?.message || "No se pudo generar automáticamente, intenta manualmente.")
        }
      } else {
        setAutoGenMsg("")
      }
    }
    autoGenerate()
  }, [qr, ownerUserId, validOwner, generateUserQr])

  // Botón para crear/regenerar manualmente
  const onRegenerate = async () => {
    if (!validOwner) return
    await generateUserQr({ ownerUserId: ownerUserId as Id<"users"> })
    setCopied(false)
  }

  // Generar PNG del QR en el navegador cuando cambie el payload
  React.useEffect(() => {
    const makePng = async () => {
      if (!qr?.payload) {
        setQrPngDataUrl("")
        return
      }
      setPngLoading(true)
      try {
        const QRCode = await import("qrcode")
        const url = await QRCode.toDataURL(qr.payload, {
          width: 512,
          errorCorrectionLevel: "M",
          margin: 2,
          color: { dark: "#151515", light: "#ffffff" },
        })
        setQrPngDataUrl(url)
      } finally {
        setPngLoading(false)
      }
    }
    makePng()
  }, [qr?.payload])

  const onCopyPayload = async () => {
    if (!qr?.payload) return
    try {
      await navigator.clipboard.writeText(qr.payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  const onDownloadPng = () => {
    if (!qrPngDataUrl) return
    const a = document.createElement("a")
    a.href = qrPngDataUrl
    a.download = `qr-${qr?.code || "codigo"}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const showInvalid = ownerUserId.length > 0 && !validOwner

  return (
    <div className="grid gap-6">
      {/* Columna izquierda: vista del QR */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerUserId">{"ID de usuario (Convex Id)"}</Label>
          <div className="flex gap-2">
           {/*  <Input
              id="ownerUserId"
              value={ownerUserId}
              aria-invalid={showInvalid}
              aria-describedby="ownerUserId-help" 
              className="disable-autofill"
            /> */}
            <Button onClick={onRegenerate} disabled={!validOwner}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {qr ? "Regenerar" : "Crear"}
            </Button>
          </div>
          <p id="ownerUserId-help" className="text-xs text-muted-foreground">
            {"Debe ser un Id de Convex válido (min 10 caracteres, a-z0-9, sin espacios)."}
          </p>
          {showInvalid && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {"El valor ingresado no parece un Id de Convex. No se harán llamadas hasta que sea válido."}
            </div>
          )}
          {autoGenMsg ? (
            <p className="text-xs text-red-600">{autoGenMsg}</p>
          ) : qr === undefined && validOwner ? (
            <p className="text-xs text-muted-foreground">{"Cargando..."}</p>
          ) : null}
        </div>

        <div className="aspect-square h-[400px] w-[400px]  overflow-hidden rounded-lg border bg-white">
          {qrPngDataUrl ? (
            <Image
              src={qrPngDataUrl || "/placeholder.svg"}
              alt={"Código QR"}
              width={400}
              height={400}
              className="h-[400px] w-[400px] object-contain"
              priority
            />
          ) : (
            <Image
              src={"/placeholder.svg?height=400&width=400&query=qr+placeholder"}
              alt={"QR no disponible"}
              width={400}
              height={400}
              className="h-[400px] w-[400px] object-contain"
              priority
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCopyPayload} disabled={!qr?.payload}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copiado" : "Copiar payload"}
          </Button>
          <Button onClick={onDownloadPng} disabled={!qrPngDataUrl || pngLoading}>
            <Download className="mr-2 h-4 w-4" />
            {"Descargar PNG"}
          </Button>
        </div>

        <div className="space-y-1">
          <Label>{"Código corto"}</Label>
          <div className="rounded-md border bg-muted/50 p-3 text-sm font-mono">{qr?.code ?? "—"}</div>
        </div>

      {/*   <div className="space-y-1">
          <Label>{"Payload (contenido del QR)"}</Label>
          <pre className="max-h-40 overflow-auto rounded-md border bg-muted/50 p-3 text-xs">{qr?.payload ?? "—"}</pre>
        </div> */}
      </div>

   
    </div>
  )
}
