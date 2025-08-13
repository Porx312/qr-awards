"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useMutation } from "convex/react"
import { QrCode, Keyboard, Camera, Gift } from "lucide-react"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import Image from "next/image"
import { useToast } from "@v1/ui/use-toast"
import { api } from "@v1/backend/convex/_generated/api"
import { parseQrPayload } from "@/locales/qrutil"
import { cn } from "@v1/ui/utils"

type Client = {
  id: string
  name?: string
  email?: string
}

type GrantStampsResponse = {
  success: boolean
  stampsGranted?: number
  totalStamps?: number
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

export default function GrantStampsForm() {
  const { toast } = useToast()
  const grantStampsFromPayload = useMutation(api.stamps.grantStampsFromPayload)
  const grantStampsByCode = useMutation(api.stamps.grantStampsByCode)

  const [mode, setMode] = React.useState<"scan" | "code">("scan")
  const [lastNonce, setLastNonce] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [stampsToGrant, setStampsToGrant] = React.useState("1")
  const [result, setResult] = React.useState<{
    client: Client
    stampsGranted: number
    totalStamps: number
    info?: GrantStampsResponse["qr"]
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  function switchTo(newMode: "scan" | "code") {
    setMode(newMode)
    setError(null)
  }

  async function doGrantStamps(resolver: () => Promise<GrantStampsResponse>) {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await resolver()
      if (!res?.success) {
        setError("No fue posible otorgar los puntos.")
        toast({ title: "Error al otorgar puntos", description: "Inténtalo nuevamente.", variant: "destructive" })
        return
      }
      setResult({
        client: { id: res.clientId || "cliente", name: "Cliente" },
        stampsGranted: res.stampsGranted || 0,
        totalStamps: res.totalStamps || 0,
        info: res.qr,
      })
      toast({
        title: "¡Puntos otorgados exitosamente!",
        description: `Se otorgaron ${res.stampsGranted} puntos. Total: ${res.totalStamps}`,
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
    void doGrantStamps(
      () =>
        grantStampsFromPayload({
          payload: { userId: parsed.userId as any, code: parsed.code, nonce: parsed.nonce, ts: parsed.ts },
          quantity: Number.parseInt(stampsToGrant) || 1,
        }) as Promise<GrantStampsResponse>,
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
    void doGrantStamps(() => grantStampsByCode({ code: cleaned, quantity }) as Promise<GrantStampsResponse>)
  }

  if (result?.client) {
    const c = result.client
    return (
      <SuccessCard
        title="¡Puntos otorgados exitosamente!"
        subtitle={`Se otorgaron ${result.stampsGranted} puntos. El cliente ahora tiene ${result.totalStamps} puntos en total.`}
        client={c}
        stampsGranted={result.stampsGranted}
        totalStamps={result.totalStamps}
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

      {/* Selector de cantidad de puntos */}
      <div className="grid gap-2">
        <Label htmlFor="stamps-quantity">Puntos a otorgar</Label>
        <Input
          id="stamps-quantity"
          type="number"
          min="1"
          max="10"
          value={stampsToGrant}
          onChange={(e) => setStampsToGrant(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Cantidad de puntos que se otorgarán al cliente (1-10).</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {mode === "scan" ? (
        <div className="space-y-3">
          <div className={cn("overflow-hidden rounded-md border")}>
            <QrScanner onDecode={(text: string) => onScanText(text)} onError={() => {}} />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            Necesitamos permiso de cámara para leer el QR del cliente.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleManualSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="code">Código del cliente</Label>
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
              Este es el código corto del cliente que aparece junto a su QR.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? "Procesando…"
              : `Otorgar ${stampsToGrant} punto${Number.parseInt(stampsToGrant) !== 1 ? "s" : ""}`}
          </Button>
        </form>
      )}
    </div>
  )
}

function SuccessCard({
  title = "Puntos otorgados",
  subtitle = "Los puntos se han agregado correctamente.",
  client,
  stampsGranted,
  totalStamps,
  qrInfo,
}: {
  title?: string
  subtitle?: string
  client: Client
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
