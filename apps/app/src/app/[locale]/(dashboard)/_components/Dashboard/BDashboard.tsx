"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import {
  Users,
  Gift,
  QrCode,
  UserPlus,
  ShoppingBag,
  Star,
  AlertTriangle,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import { useQuery } from "convex/react"
import { Id } from "@v1/backend/convex/_generated/dataModel"
import { api } from "@v1/backend/convex/_generated/api"

interface BusinessDashboardProps {
  userId: Id<"users">
}

export function BusinessDashboard({ userId }: BusinessDashboardProps) {
  const currentUser = useQuery(api.users.getUserById, { userId })
  const subscribers = useQuery(api.subscriptionsqr.getBusinessSubscribers, { businessId: userId })
  const stamps = useQuery(api.stamps.getBusinessStamps, { businessId: userId })
  const rewards = useQuery(api.rewards.getBusinessRewards, { businessId: userId })
  const redemptions = useQuery(api.rewards.getBusinessRedemptions, { businessId: userId })
  const qrCodes = useQuery(api.qr.getBusinessQRCodes, { businessId: userId })

  // Loading state
  if (!currentUser || !subscribers || !stamps || !rewards || !redemptions) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const totalSubscribers = subscribers.length
  const totalStampsGranted = stamps.reduce((sum: number, stamp: any) => sum + stamp.quantity, 0)
  const totalRedemptions = redemptions.length
  const newSubscribersThisMonth = subscribers.filter(
    (sub: any) => sub.subscribedAt > Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).length

  const clientStampCounts = new Map()
  stamps.forEach((stamp: any) => {
    const clientId = stamp.clientId
    const existing = clientStampCounts.get(clientId) || { client: stamp.client, totalStamps: 0, stamps: [] }
    existing.totalStamps += stamp.quantity
    existing.stamps.push(stamp)
    clientStampCounts.set(clientId, existing)
  })
  const topClients = Array.from(clientStampCounts.values())
    .sort((a, b) => b.totalStamps - a.totalStamps)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Negocio</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentUser.businessName || "Mi Negocio"} - {currentUser.location || currentUser.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Activo
              </Badge>
              <Button size="sm" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Mi QR
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscriptores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">Total de clientes suscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Suscriptores</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newSubscribersThisMonth}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stamps Otorgados</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStampsGranted}</div>
              <p className="text-xs text-muted-foreground">Total acumulado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canjes Realizados</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRedemptions}</div>
              <p className="text-xs text-muted-foreground">Total de canjes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Clientes Más Activos
              </CardTitle>
              <CardDescription>Top clientes por stamps acumulados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.length > 0 ? (
                  topClients.map((clientData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{clientData.client?.name || "Cliente"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {clientData.totalStamps} stamps totales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{clientData.stamps.length} transacciones</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay clientes activos aún</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-500" />
                Gestión de Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Recompensas Activas</span>
                  <span>{rewards.length}</span>
                </div>
                <div className="space-y-2">
                  {rewards.slice(0, 3).map((reward: any, index: number) => (
                    <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{reward.name}</span>
                        <span className="text-xs text-gray-500">{reward.requiredStamps} stamps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Canjes Recientes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {redemptions.length} canjes realizados en total
                </p>
                <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  Ver Detalles
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Crear Nueva Recompensa</h4>
                <Button size="sm" className="w-full">
                  + Agregar Recompensa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Centro de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Códigos QR</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">{qrCodes?.length || 0} códigos QR activos</p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                  Gestionar QR
                </Button>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Recompensas Activas</h4>
                <p className="text-sm text-green-600 dark:text-green-300">{rewards.length} recompensas disponibles</p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                  Ver Recompensas
                </Button>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Actividad Reciente</h4>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {stamps.length} stamps otorgados en total
                </p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                  Ver Actividad
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre del Negocio</label>
                <p className="font-medium">{currentUser.businessName || "No configurado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Categoría</label>
                <p className="font-medium">{currentUser.businessCategory || "No configurado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ubicación</label>
                <p className="font-medium">{currentUser.location || "No configurado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ciudad</label>
                <p className="font-medium">{currentUser.city || "No configurado"}</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Editar Información
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stamps.slice(0, 5).map((stamp: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {stamp.quantity} stamps otorgados a {stamp.client?.name || "Cliente"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(stamp.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                      stamps
                    </Badge>
                  </div>
                ))}
                {stamps.length === 0 && <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
