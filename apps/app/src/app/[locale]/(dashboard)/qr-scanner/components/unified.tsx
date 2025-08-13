"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useMutation } from "convex/react"
import { QrCode, Keyboard, Camera, Gift, CheckCircle2, Clock } from 'lucide-react'
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import Image from "next/image"
import { useToast } from "@v1/ui/use-toast"
import { api } from "@v1/backend/convex/_generated/api"
import { parseQrPayload } from "@/locales/qrutil"
import { cn } from "@v1/ui/utils"


type UnifiedResponse = {
  success: boolean
  action: "subscribe" | "grantStamps"
  alreadySubscribed?: boolean
  subscriptionId?: string
  stampsGranted?: number
  totalStamps?: number
  clientId: string
  businessId: string
  targetUser: {
    id: string
    name?: string
    role: string // Changed from union type to string to match backend
  }
  qr: { ownerUserId: string; code: string; payload: string; updatedAt: number }
}

const QRScannerClient = dynamic(() => import("./qr-scanner-client"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[280px] place-items-center rounded-md border bg-muted/40">
      <span className="text-sm text-muted-foreground">Cargando cámara…</span>
    </div>
  ),
})

export default function UnifiedQRForm() {
  const { toast } = useToast()
  const processQRAction = useMutation(api.qrstamps.processQRAction)

  const [mode, setMode] = React.useState<"scan" | "code">("scan")
  const [lastNonce, setLastNonce] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [stampsToGrant, setStampsToGrant] = React.useState("1")
  const [result, setResult] = React.useState<UnifiedResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  function switchTo(newMode: "scan" | "code") {
    setMode(newMode)
    setError(null)
  }

  async function doProcessQR(resolver: () => Promise<UnifiedResponse>) {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await resolver()

      if (!res?.success && res?.action === "subscribe" && res?.stampsGranted === 0) {
        // Límite diario alcanzado
        setResult(res)
        toast({
          title: "Límite diario alcanzado",
          description: "Ya escaneaste este negocio hoy. Vuelve mañana para obtener más puntos.",
          variant: "destructive",
        })
        return
      }

      if (!res?.success) {
        setError("No fue posible procesar la acción.")
        toast({ title: "Error", description: "Inténtalo nuevamente.", variant: "destructive" })
        return
      }
      setResult(res)

      if (res.action === "subscribe") {
        toast({
          title: res.alreadySubscribed ? "Ya estabas suscrito" : "¡Suscripción exitosa!",
          description: res.alreadySubscribed
            ? `Ya tenías una suscripción activa. Se otorgó ${res.stampsGranted} punto adicional. Total: ${res.totalStamps} puntos.`
            : `Te suscribiste exitosamente y recibiste ${res.stampsGranted} punto de bienvenida. Total: ${res.totalStamps} puntos.`,
        })
      } else if (res.action === "grantStamps") {
        toast({
          title: "¡Puntos otorgados exitosamente!",
          description: `Se otorgaron ${res.stampsGranted} puntos. El cliente ahora tiene ${res.totalStamps} puntos en total.`,
        })
      }
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
    void doProcessQR(() =>
     // Cliente
processQRAction({
  payload: {
    userId: parsed.userId as any, // fuerza cast solo para envío
    code: parsed.code,
    nonce: parsed.nonce,
    ts: parsed.ts,
  },
  stampsQuantity: Number.parseInt(stampsToGrant) || 1,
})

    )
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = code.trim().toUpperCase()
    if (!cleaned) {
      setError("Ingresa un código válido.")
      return
    }
    const quantity = Number.parseInt(stampsToGrant) || 1
    if (quantity < 1 || quantity > 10) {
      setError("La cantidad debe ser entre 1 y 10 puntos.")
      return
    }
    void doProcessQR(() => processQRAction({ code: cleaned, stampsQuantity: quantity }))
  }

  if (result) {
    if (result.action === "subscribe") {
      if (!result.success && result.stampsGranted === 0) {
        return <DailyLimitCard
  business={result.targetUser}
  totalStamps={result.totalStamps ?? 0}
  qrInfo={result.qr}
/>

      }

      return (
        <SubscribeSuccessCard
          title={result.alreadySubscribed ? "¡Ya estabas suscrito!" : "¡Suscripción exitosa!"}
          subtitle={
            result.alreadySubscribed
              ? `Ya tenías una suscripción activa. Se otorgó ${result.stampsGranted} punto adicional. Total: ${result.totalStamps} puntos.`
              : `Te suscribiste exitosamente y recibiste ${result.stampsGranted} punto de bienvenida. Total: ${result.totalStamps} puntos.`
          }
          business={result.targetUser}
          stampsGranted={result.stampsGranted}
          totalStamps={result.totalStamps}
          qrInfo={result.qr}
        />
      )
    } else if (result.action === "grantStamps") {
      return (
   <StampsSuccessCard
  title="¡Puntos otorgados exitosamente!"
  subtitle={`Se otorgaron ${result.stampsGranted ?? 0} puntos. El cliente ahora tiene ${result.totalStamps ?? 0} puntos en total.`}
  client={result.targetUser}
  stampsGranted={result.stampsGranted ?? 0}
  totalStamps={result.totalStamps ?? 0}
  qrInfo={result.qr}
/>
      )
    }
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

      {/* Selector de cantidad de puntos (solo visible para negocios) */}
      <div className="grid gap-2">
        <Label htmlFor="stamps-quantity">Puntos a otorgar (si eres negocio)</Label>
        <Input
          id="stamps-quantity"
          type="number"
          min="1"
          max="10"
          value={stampsToGrant}
          onChange={(e) => setStampsToGrant(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Si eres cliente escaneando un negocio, este campo se ignora. Si eres negocio escaneando un cliente, esta es la
          cantidad de puntos que otorgarás (1-10).
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {mode === "scan" ? (
        <div className="space-y-3">
          <div className={cn("overflow-hidden rounded-md border")}>
            <QRScannerClient onDecode={(text: string) => onScanText(text)} onError={() => {}} />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            Necesitamos permiso de cámara para leer el QR.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleManualSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="code">Código</Label>
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
              Ingresa el código del negocio (para suscribirte) o del cliente (para otorgar puntos).
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Procesando…" : "Procesar"}
          </Button>
        </form>
      )}
    </div>
  )
}

function DailyLimitCard({
  business,
  totalStamps,
  qrInfo,
}: {
  business: { id: string; name?: string; role: string }
  totalStamps: number
  qrInfo?: { ownerUserId: string; code: string; payload: string; updatedAt: number }
}) {
  return (
    <Card className="border-orange-600/20 bg-orange-50/40 dark:bg-orange-950/20">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="mt-1 rounded-full bg-orange-600/10 p-2">
          <Clock className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <CardTitle className="text-lg">Límite diario alcanzado</CardTitle>
          <CardDescription>Ya escaneaste este negocio hoy. Vuelve mañana para obtener más puntos.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-background">
          <Image
            src="/business-logo.png"
            alt={`Logo de ${business.name || "Negocio"}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{business.name || `Negocio ${business.id}`}</p>
          <p className="text-sm text-muted-foreground">0 puntos otorgados hoy</p>
          <p className="text-sm font-medium text-orange-600">Total actual: {totalStamps} puntos</p>
          {qrInfo ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {"QR verificado: "}
              {"Código "}
              {qrInfo.code}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function SubscribeSuccessCard({
  title = "Suscripción completada",
  subtitle = "Empieza a escanear para sumar puntos.",
  business,
  stampsGranted,
  totalStamps,
  qrInfo,
}: {
  title?: string
  subtitle?: string
  business: { id: string; name?: string; role: string }
  stampsGranted?: number
  totalStamps?: number
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
            src="/business-logo.png"
            alt={`Logo de ${business.name || "Negocio"}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{business.name || `Negocio ${business.id}`}</p>
          {stampsGranted && totalStamps && (
            <>
              <p className="text-sm text-muted-foreground">+{stampsGranted} puntos recibidos</p>
              <p className="text-sm font-medium text-green-600">Total: {totalStamps} puntos</p>
            </>
          )}
          {qrInfo ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {"QR verificado: "}
              {"Código "}
              {qrInfo.code}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function StampsSuccessCard({
  title = "Puntos otorgados",
  subtitle = "Los puntos se han agregado correctamente.",
  client,
  stampsGranted,
  totalStamps,
  qrInfo,
}: {
  title?: string
  subtitle?: string
  client: { id: string; name?: string; role: string }
  stampsGranted: number
  totalStamps: number
  qrInfo?: { ownerUserId: string; code: string; payload: string; updatedAt: number }
}) {
  return (
    <Card className="border-green-600/20 bg-green-50/40 dark:bg-green-950/20">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="mt-1 rounded-full bg-green-600/10 p-2">
          <Gift className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-background">
          <Image
            src="/customer-avatar.png"
            alt={`Avatar de ${client.name || "Cliente"}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{client.name || `Cliente ${client.id}`}</p>
          <p className="text-sm text-muted-foreground">+{stampsGranted} puntos otorgados</p>
          <p className="text-sm font-medium text-green-600">Total: {totalStamps} puntos</p>
          {qrInfo ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {"QR verificado: "}
              {"Código "}
              {qrInfo.code}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}