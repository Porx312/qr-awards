import { Suspense } from "react"
import Image from "next/image"
import { Skeleton } from "@v1/ui/skeleton"
import { Separator } from "@v1/ui/separator"
import { getClientSubscriptions } from "./components/mock-data"
import SubscriptionList from "./components/subscription-list"

export const dynamic = "force-dynamic"

export default async function Page() {
  // En tu app real, obtén el userId desde tu auth (ej. Convex auth).
  const clientId = "client_1"
  const data = await getClientSubscriptions(clientId)

  return (
    <main className="min-h-[100dvh]">
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
          <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-center">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mis suscripciones</h1>
              <p className="text-muted-foreground">
                Consulta tus negocios favoritos y canjea tus recompensas con tus puntos acumulados.
              </p>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-background/60 to-background/20 backdrop-blur-sm" />
              <Image
                src="/images/loyalty-inspiration.jpeg"
                alt="Inspiración de tarjeta de fidelidad"
                width={800}
                height={600}
                className="rounded-xl border object-cover w-full h-48"
                priority
              />
            </div>
          </div>
        </div>
        <Separator />
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <Skeleton key={j} className="h-10 w-full rounded-full" />
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <SubscriptionList initialData={data} />
        </Suspense>
      </section>
    </main>
  )
}
