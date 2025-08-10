"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useMutation } from "convex/react"
import { QrCode, Keyboard, CheckCircle2, AlertCircle, Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@v1/ui/alert"
import Image from "next/image"
import { useToast } from "@v1/ui/use-toast"
import { api } from "@v1/backend/convex/_generated/api"
import { parseQrPayload } from "@/locales/qrutil"

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

const QrReader = dynamic(
  async () => {
    const mod = await import("react-qr-reader")
    return mod.QrReader
  },
  {
    ssr: false,
    loading: () => (
      <div className="grid place-items-center h-[280px] rounded-md border bg-muted/40">
        <span className="text-sm text-muted-foreground">Cargando cámara…</span>
      </div>
    ),
  },
)

export default function SubscribeForm() {
  const { toast } = useToast()
  const subscribeFromPayload = useMutation(api["qrsubscribe"].subscribeFromPayload)
  const subscribeByCode = useMutation(api["qrsubscribe"].subscribeByCode)

  const [activeTab, setActiveTab] = React.useState<"qr" | "code">("qr")
  const [lastNonce, setLastNonce] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [result, setResult] = React.useState<{ business: Business; info?: SubscribeResponse["qr"] } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => setError(null), [activeTab])

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
      // Nota: Si tienes datos públicos del negocio, puedes buscarlos por businessId
      setResult({
        business: { id: res.businessId || "negocio", name: "Negocio", logoUrl: "", rewardsSummary: "" },
        info: res.qr,
      })
      toast({
        title: res.alreadySubscribed ? "Ya estabas suscrito" : "¡Suscripción exitosa!",
        description: res.alreadySubscribed ? "Este vínculo ya existía." : "Vinculamos tu cuenta correctamente.",
      })
    } catch (e) {
      setError("Ocurrió un error de red o autenticación.")
      toast({ title: "Error", description: "Verifica tu sesión e inténtalo de nuevo.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  function onScanResult(result: any) {
    const text: string | undefined = result?.getText ? result.getText() : undefined
    if (!text) return
    const parsed = parseQrPayload(text)
    if (!parsed) {
      setError("El QR no contiene un payload válido.")
      return
    }
    if (parsed.nonce === lastNonce) return // evitar dobles envíos
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
      {error ? (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ocurrió un problema</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "qr" | "code")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            {"Escanear QR"}
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2">
            <Keyboard className="h-4 w-4" />
            {"Código"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="mt-4">
          <div className="space-y-3">
            <div className={cn("overflow-hidden rounded-md border")}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result: any, _err: any) => {
                  if (result) onScanResult(result)
                }}
                videoContainerStyle={{ width: "100%", borderRadius: 6 }}
                videoStyle={{ width: "100%", display: "block" }}
                className="w-full [&_video]:w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">Apunta la cámara al código QR del negocio o del cliente.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Camera className="h-3.5 w-3.5" />
              <span>{"Necesitamos permiso de cámara para leer el QR."}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
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
        </TabsContent>
      </Tabs>
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
