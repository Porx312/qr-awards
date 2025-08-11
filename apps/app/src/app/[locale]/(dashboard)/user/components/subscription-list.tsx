"use client"

import * as React from "react"
import type { ClientSubscriptions } from "./types"
import { Input } from "@v1/ui/input"
import { Button } from "@v1/ui/button"
import { ListFilter, LayoutGrid, Rows } from "lucide-react"
import BusinessCard from "./business-card"
import { cn } from "@v1/ui/utils"

type Props = {
  initialData?: ClientSubscriptions
}

export default function SubscriptionList(
  { initialData }: Props = { initialData: { clientId: "", subscriptions: [] } },
) {
  const [query, setQuery] = React.useState("")
  const [layout, setLayout] = React.useState<"grid" | "list">("grid")
  const [data, setData] = React.useState<ClientSubscriptions>(initialData ?? { clientId: "", subscriptions: [] })

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.subscriptions
    return data.subscriptions.filter((s) => {
      const hay = [s.business.businessName, s.business.businessCategory, s.business.city].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [data, query])

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
        {filtered.map((sub) => (
          <BusinessCard
            key={sub.business.businessId}
            data={sub}
            layout={layout}
            onChange={(updated) => {
              setData((prev) => ({
                ...prev,
                subscriptions: prev.subscriptions.map((s) =>
                  s.business.businessId === updated.business.businessId ? updated : s,
                ),
              }))
            }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground p-8 border rounded-xl">
            No se encontraron negocios para tu búsqueda.
          </div>
        )}
      </div>
    </div>
  )
}
