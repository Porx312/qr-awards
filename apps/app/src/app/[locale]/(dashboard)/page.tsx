"use client"

import { useState, useEffect } from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { useMutation } from "convex/react"
import { Button } from "@v1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Building2, User, CreditCard, Loader2 } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { SaasHeader } from "./_components/Header/Header"
import { ClientDashboard } from "./_components/Dashboard/CDashboard"
import { BusinessDashboard } from "./_components/Dashboard/BDashboard"

export default function HomePage() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(api.users.getUser)
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  useEffect(() => {
    if (currentUser && !currentUser.role) {
      setShowRoleSelection(true)
    }
  }, [currentUser])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Cargando StampMe Card...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login

  // User exists but no role - show role selection


  if (currentUser?.role === "business") {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessDashboard userId={currentUser._id} />
      </div>
    )
  }

  if (currentUser?.role === "client") {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientDashboard userId={currentUser._id} />
      </div>
    )
  }

 
}

