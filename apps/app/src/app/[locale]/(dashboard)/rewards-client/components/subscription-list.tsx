"use client"

import * as React from "react"
import type { AggregatedSubscription, ClientSubscriptions } from "./types"
import { Input } from "@v1/ui/input"
import { Button } from "@v1/ui/button"
import { ListFilter, LayoutGrid, Rows, Loader2 } from "lucide-react"
import BusinessCard from "./business-card"
import { cn } from "@v1/ui/utils"
import { api } from "@v1/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { Id } from "@v1/backend/convex/_generated/dataModel"

type Props = {
  initialData?: ClientSubscriptions
}

export default function SubscriptionList(
  { initialData }: Props = { initialData: { clientId: "" as Id<"users">, subscriptions: [] }
 },
) {
  const [query, setQuery] = React.useState("")
  const [layout, setLayout] = React.useState<"grid" | "list">("grid")

  const liveData = useQuery(api.subs.getClientSubscriptionsAggregated) as
    | ClientSubscriptions
    | null
    | undefined
  const data = liveData || initialData || { clientId: "", subscriptions: [] }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.subscriptions
    return data.subscriptions.filter((s: AggregatedSubscription) => {
      const hay = [s.business.businessName, s.business.businessCategory, s.business.city].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [data, query])

  if (liveData === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando suscripciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría o ciudad..."
            className="w-full sm:w-[360px]"
            aria-label="Buscar negocios"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("grid")}
            aria-pressed={layout === "grid"}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cuadrícula
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("list")}
            aria-pressed={layout === "list"}
          >
            <Rows className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      <div className={cn("gap-4", layout === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col")}>
        {filtered.map((sub: AggregatedSubscription) => (
          <BusinessCard key={sub.business.businessId} data={sub} layout={layout} />
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground p-8 border rounded-xl">
            {data.subscriptions.length === 0
              ? "No tienes suscripciones activas. ¡Empieza a seguir negocios para acumular sellos!"
              : "No se encontraron negocios para tu búsqueda."}
          </div>
        )}
      </div>
    </div>
  )
}
