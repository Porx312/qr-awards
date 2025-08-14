"use client"

import * as React from "react"
import Image from "next/image"
import { useQuery, useMutation } from "convex/react"
import { Button } from "@v1/ui/button"
import { Card } from "@v1/ui/card"
import {  Download,  QrCode, Camera, RotateCcw, Copy, Check } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { Id } from "@v1/backend/convex/_generated/dataModel"
import Link from "next/link"

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

export default function QrCarduser({ defaultOwnerUserId = "" }: Props) {
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
    if (!qr?.code) return
    try {
      await navigator.clipboard.writeText(qr.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
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


  return (
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between gap-3 py-3">
          {/* Orange Scan QR Button */}
          <div className="flex flex-col w-full items-center gap-3">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
           <Link href="/qr-scanner" className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Escanear QR
           </Link>
          </Button>

          {/* Code Display and Action Buttons Row */}
            {/* Black Code Display */}
               <Button   onClick={onCopyPayload} disabled={!qr?.payload} className="w-full bg-black text-white font-mono text-center py-3 px-4  gap-2 rounded-xl font-semibold tracking-wider">
               {!copied ? 
                <div className="flex items-center gap-2 justify-between">
                 <Copy  className="w-5 h-5"/>
                 {qr?.code ?? "—"}
                </div>
                  : 
               <Check className="w-5 h-5 text-green-500" />
               }
               </Button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Camera Button */}
               <Button onClick={onDownloadPng} size="icon" variant="outline" disabled={!qrPngDataUrl || pngLoading} className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center">
            <Download className="h-4 w-4" />
          </Button>

              {/* Refresh Button */}
            
               <Button onClick={onRegenerate} disabled={!validOwner} size="icon" className="w-12 h-12 rounded-xl bg-black hover:bg-gray-800 text-white">
                <RotateCcw className="w-5 h-5" />
            </Button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center pt-2">
            <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                   {qrPngDataUrl ? (
            <Image
              src={qrPngDataUrl || "/placeholder.svg"}
              alt={"Código QR"}
              width={400}
              height={400}
              className="w-36 h-36 object-contain"
              priority
            />
          ) : (
            <Image
              src={"/placeholder.svg?height=400&width=400&query=qr+placeholder"}
              alt={"QR no disponible"}
              width={400}
              height={400}
              className="w-36 h-36 object-contain"
              priority
            />
          )}
            </div>
          </div>
        </div>
      </Card>
  )
}
