"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useMutation } from "convex/react"
import { QrCode, Keyboard, CheckCircle2, Camera } from "lucide-react"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import Image from "next/image"
import { useToast } from "@v1/ui/use-toast"
import { api } from "@v1/backend/convex/_generated/api"
import { parseQrPayload } from "@/locales/qrutil"
import { cn } from "@v1/ui/utils"

type Business = {
  id: string
  name?: string
  logoUrl?: string
  rewardsSummary?: string
}

type SubscribeResponse = {
  success: boolean
  alreadySubscribed?: boolean
  subscriptionId?: string
  clientId?: string
  businessId?: string
  qr?: { ownerUserId: string; code: string; payload: string; updatedAt: number }
}

const QrScanner = dynamic(() => import("./qr-scanner-client"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[280px] place-items-center rounded-md border bg-muted/40">
      <span className="text-sm text-muted-foreground">Cargando cámara…</span>
    </div>
  ),
})

export default function SubscribeForm() {
  const { toast } = useToast()
  // Usa el namespace correcto según tu proyecto: "qrsuscribe"
  const subscribeFromPayload = useMutation(api.qrsuscribe.subscribeFromPayload)
  const subscribeByCode = useMutation(api.qrsuscribe.subscribeByCode)

  const [mode, setMode] = React.useState<"scan" | "code">("scan")
  const [lastNonce, setLastNonce] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [result, setResult] = React.useState<{ business: Business; info?: SubscribeResponse["qr"] } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  function switchTo(newMode: "scan" | "code") {
    setMode(newMode)
    setError(null)
  }

  async function doSubscribe(resolver: () => Promise<SubscribeResponse>) {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await resolver()
      if (!res?.success) {
        setError("No fue posible completar la suscripción.")
        toast({ title: "No fue posible suscribirte", description: "Inténtalo nuevamente.", variant: "destructive" })
        return
      }
      setResult({
        business: { id: res.businessId || "negocio", name: "Negocio" },
        info: res.qr,
      })
      toast({
        title: res.alreadySubscribed ? "Ya estabas suscrito" : "¡Suscripción exitosa!",
        description: res.alreadySubscribed ? "Este vínculo ya existía." : "Vinculamos tu cuenta correctamente.",
      })
    } catch {
      setError("Ocurrió un error de red o autenticación.")
      toast({ title: "Error", description: "Verifica tu sesión e inténtalo de nuevo.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  function onScanText(text: string) {
    const parsed = parseQrPayload(text)
    if (!parsed) {
      setError("El QR no contiene un payload válido.")
      return
    }
    if (parsed.nonce === lastNonce) return // Evitar dobles envíos con el mismo QR
    setLastNonce(parsed.nonce)
    void doSubscribe(
      () =>
        subscribeFromPayload({
          payload: { userId: parsed.userId as any, code: parsed.code, nonce: parsed.nonce, ts: parsed.ts },
        }) as Promise<SubscribeResponse>,
    )
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = code.trim().toUpperCase()
    if (!cleaned) {
      setError("Ingresa un código válido.")
      return
    }
    void doSubscribe(() => subscribeByCode({ code: cleaned }) as Promise<SubscribeResponse>)
  }

  if (result?.business) {
    const b = result.business
    return (
      <SuccessCard
        title="¡Listo! Suscripción creada"
        subtitle="Ya puedes comenzar a acumular puntos cuando visites el local."
        business={b}
        qrInfo={result.info}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-2">
        <Button
          type="button"
          variant={mode === "scan" ? "default" : "outline"}
          className="flex-1 gap-2"
          onClick={() => switchTo("scan")}
        >
          <QrCode className="h-4 w-4" />
          Escanear QR
        </Button>
        <Button
          type="button"
          variant={mode === "code" ? "default" : "outline"}
          className="flex-1 gap-2"
          onClick={() => switchTo("code")}
        >
          <Keyboard className="h-4 w-4" />
          Código manual
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {mode === "scan" ? (
        <div className="space-y-3">
          <div className={cn("overflow-hidden rounded-md border")}>
            <QrScanner onDecode={(text: string) => onScanText(text)} onError={() => {}}  />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            Necesitamos permiso de cámara para leer el QR.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleManualSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="code">Código del negocio</Label>
            <Input
              id="code"
              name="code"
              placeholder="Ej: 8MQMVS8U"
              inputMode="text"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                setCode(v)
              }}
              maxLength={16}
              aria-describedby="code-help"
            />
            <p id="code-help" className="text-xs text-muted-foreground">
              Este es el código corto que aparece junto al QR.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Procesando…" : "Suscribirme"}
          </Button>
        </form>
      )}
    </div>
  )
}

function SuccessCard({
  title = "Suscripción completada",
  subtitle = "Empieza a escanear para sumar puntos.",
  business,
  qrInfo,
}: {
  title?: string
  subtitle?: string
  business: Business
  qrInfo?: { ownerUserId: string; code: string; payload: string; updatedAt: number }
}) {
  return (
    <Card className="border-green-600/20 bg-green-50/40 dark:bg-green-950/20">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="mt-1 rounded-full bg-green-600/10 p-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-background">
          <Image
            src={business.logoUrl || "/placeholder.svg?height=128&width=128&query=logo%20del%20negocio"}
            alt={`Logo de ${business.name || "Negocio"}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{business.name || `Negocio ${business.id}`}</p>
          {business.rewardsSummary ? (
            <p className="truncate text-sm text-muted-foreground">{business.rewardsSummary}</p>
          ) : null}
          {qrInfo ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {"QR verificado: "}
              {"Código "}
              {qrInfo.code}
              {" • Dueño "}
              {qrInfo.ownerUserId}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
