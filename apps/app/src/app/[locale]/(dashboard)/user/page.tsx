"use client"

import { useQuery } from "convex/react"
import SubscriptionList from "./components/subscription-list"
import { Loader2 } from 'lucide-react'
import type { ClientSubscriptions } from "./components/types"
import { api } from "@v1/backend/convex/_generated/api"

export default function MySubscriptionsPage() {
  // <CHANGE> Direct usage of Convex hooks without conditional checks
  const data = useQuery(api.subs.getClientSubscriptionsAggregated) as ClientSubscriptions | null | undefined

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mis Suscripciones</h1>
          <p className="text-muted-foreground">Debes iniciar sesión como cliente para ver tus suscripciones.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Suscripciones</h1>
        <p className="text-muted-foreground">Gestiona tus sellos y canjea recompensas en tus negocios favoritos.</p>
      </div>

      <SubscriptionList initialData={data} />
    </div>
  )
}
