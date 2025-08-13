"use client"

import { useState, useEffect } from "react"
import { useConvexAuth, useQuery } from "convex/react"
import { Button } from "@v1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Building2, User, CreditCard, Loader2 } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { BusinessDashboard } from "./_components/Dashboard/BDashboard"
import { ClientDashboard } from "./_components/Dashboard/CDashboard"

export default function HomePage() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(api.users.currentUser)
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
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <CreditCard className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">StampMe Card</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Plataforma de fidelización que conecta negocios y clientes a través de recompensas inteligentes
            </p>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Accede a tu cuenta para continuar</CardDescription>
              </CardHeader>
              <CardContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // User exists but no role - show role selection
  if (currentUser && !currentUser.role) {
    return <RoleSelection userId={currentUser._id} />
  }

  if (currentUser?.role === "business") {
    return <BusinessDashboard  userId={currentUser._id} />
  }

  if (currentUser?.role === "client") {
    return <ClientDashboard  userId={currentUser._id} />
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-300">Configurando tu cuenta...</p>
      </div>
    </div>
  )
}

function RoleSelection({ userId }: { userId: string }) {
  const [selectedRole, setSelectedRole] = useState<"business" | "client" | null>(null)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    location: "",
    city: "",
    businessCategory: "",
  })

  const handleRoleSelection = async (role: "business" | "client") => {
    setSelectedRole(role)

    if (role === "client") {
      // For clients, just update the role
      // Implementation would use the updateUserProfile mutation
      console.log("Setting up client account...")
    }
  }

  const handleBusinessSetup = async () => {
    // Implementation would use the updateUserProfile mutation
    console.log("Setting up business account with:", businessInfo)
  }

  if (selectedRole === "business") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configurar Negocio</h1>
              <p className="text-gray-600 dark:text-gray-300">Completa la información de tu negocio para comenzar</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información del Negocio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Negocio</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                    placeholder="Ej: Café Central"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={businessInfo.location}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, location: e.target.value })}
                    placeholder="Ej: Centro Comercial Plaza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    placeholder="Ej: Bogotá"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={businessInfo.businessCategory}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessCategory: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="cafe">Café</option>
                    <option value="retail">Retail</option>
                    <option value="beauty">Belleza</option>
                    <option value="fitness">Fitness</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setSelectedRole(null)} className="flex-1">
                    Volver
                  </Button>
                  <Button onClick={handleBusinessSetup} className="flex-1">
                    Crear Cuenta de Negocio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <CreditCard className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">StampMe Card</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-2">
            ¿Cómo quieres usar StampMe Card?
          </p>
      
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleRoleSelection("business")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Soy un Negocio</CardTitle>
              <CardDescription className="text-base">
                Quiero crear un programa de fidelización para mis clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <li>• Gestionar programa de puntos</li>
                <li>• Crear recompensas personalizadas</li>
                <li>• Analizar comportamiento de clientes</li>
                <li>• Generar códigos QR</li>
              </ul>
              <Button className="w-full" size="lg">
                Configurar Negocio
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleRoleSelection("client")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Soy un Cliente</CardTitle>
              <CardDescription className="text-base">Quiero acumular puntos y obtener recompensas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <li>• Acumular puntos en mis negocios favoritos</li>
                <li>• Canjear recompensas exclusivas</li>
                <li>• Descubrir ofertas personalizadas</li>
                <li>• Seguir mi progreso</li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Comenzar como Cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
