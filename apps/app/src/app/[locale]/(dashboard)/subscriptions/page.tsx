"use client"

import { useQuery } from "convex/react"
import Link from "next/link"
import Image from "next/image"
import { Building2, User, ArrowLeft, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@v1/ui/avatar"
import { api } from "@v1/backend/convex/_generated/api"

function formatDate(ts?: number) {
  if (!ts) return ""
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export default function SubscriptionsPage() {
  const data = useQuery(api.subscriptionsqr.mySubscriptionsDetailed)

  const isLoading = data === undefined
  const isEmpty = data && (!data.items || data.items.length === 0)

  return (
    <main className="min-h-[100svh] w-full">
      <section className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">
              {data?.role === "business" ? "Tus suscriptores (clientes)" : "Negocios a los que estás suscrito"}
            </CardTitle>
            <CardDescription>
              {data?.role === "business"
                ? "Lista de clientes que se han suscrito a tu negocio."
                : "Estos son los negocios que sigues para acumular puntos."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-md border bg-muted/30 p-4">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <EmptyState role={data?.role} />
            ) : (
              <ul className="grid grid-cols-1 gap-3">
                {data?.items?.map((item) => {
                  const u = item.otherUser
                  if (!u) return null
                  const title =
                    data.role === "business"
                      ? u.username || u.name || "Cliente"
                      : u.name || u.username || u.name || "Negocio"
                  const subtitle = data.role === "business" ? "Cliente suscrito" : "Negocio suscrito"
                  const icon =
                    data.role === "business" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />

                  return (
                    <li key={item.subscriptionId} className="flex items-center justify-between rounded-md border p-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=96&width=96&query=${encodeURIComponent(title)}`}
                            alt={title}
                          />
                          <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {icon}
                            <p className="truncate text-base font-medium">{title}</p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {subtitle} • Desde {formatDate(item.subscribedAt)}
                          </p>
                        </div>
                      </div>
                      {/* Acciones futuras: ver perfil, verificar QR, etc. */}
                      {/* <Button variant="outline" size="sm">Ver</Button> */}
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="pt-2">
              <Link href="/subscribe">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  {data?.role === "business" ? "Suscribir un cliente con QR" : "Suscribirme a un negocio"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function EmptyState({ role }: { role?: string }) {
  return (
    <div className="grid place-items-center gap-3 rounded-md border bg-muted/20 p-8 text-center">
      <Image
        src="/empty-subscriptions-state.png"
        alt="Sin suscripciones"
        width={240}
        height={140}
        className="rounded-md object-cover"
      />
      <div>
        <p className="text-base font-medium">
          {role === "business" ? "Aún no tienes clientes suscritos" : "Todavía no sigues ningún negocio"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "business"
            ? "Pide a tus clientes que escaneen tu QR para suscribirse."
            : "Visita un local y escanea su QR para empezar a acumular puntos."}
        </p>
      </div>
      <Link href="/subscribe">
        <Button className="mt-2">Ir a suscribirme</Button>
      </Link>
    </div>
  )
}
