"use client"

import { useQuery, useMutation } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Progress } from "@v1/ui/progress"
import { CreditCard, Gift, Calendar, Trophy, Bell, QrCode, Users, Loader2 } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { Id } from "@v1/backend/convex/_generated/dataModel"

interface ClientDashboardProps {
  userId: Id<"users">
}

export function ClientDashboard({ userId }: ClientDashboardProps) {
  const currentUser = useQuery(api.users.getUser)
  const subscriptionsData = useQuery(api.subs.getClientSubscriptionsAggregated)
  const mySubscriptions = useQuery(api.subscriptionsqr.mySubscriptionsDetailed)
  const redeemReward = useMutation(api.subs.redeemReward)

  // Loading state
  if (!currentUser || !subscriptionsData || !mySubscriptions) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Cargando tu StampMe Card...</p>
        </div>
      </div>
    )
  }

  const totalStamps = subscriptionsData.subscriptions.reduce((sum, sub) => sum + (sub?.totalStamps || 0), 0)
  const totalBusinesses = subscriptionsData.subscriptions.length

  const handleRedeemReward = async (businessId: Id<"users">, rewardId: Id<"rewards">) => {
    try {
      await redeemReward({ businessId, rewardId })
    } catch (error) {
      console.error("Error redeeming reward:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi StampMe Card</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  ¡Hola {currentUser.name || "Cliente"}! Bienvenido de vuelta
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Cliente Activo
              </Badge>
              <Button size="sm" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Escanear QR
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8" />
                <div>
                  <CardTitle className="text-white">Tu StampMe Card</CardTitle>
                  <CardDescription className="text-blue-100">{totalBusinesses} negocios suscritos</CardDescription>
                </div>
              </div>
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-blue-100 text-sm">Total Stamps</p>
                <p className="text-3xl font-bold">{totalStamps}</p>
                <p className="text-xs text-blue-200">En todos los negocios</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Negocios Suscritos</p>
                <p className="text-3xl font-bold">{totalBusinesses}</p>
                <p className="text-xs text-blue-200">Activos</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Próximo Canje</p>
                <p className="text-lg font-medium">
                  {totalStamps > 0 ? "Revisa tus recompensas" : "Acumula más stamps"}
                </p>
                <div className="mt-2">
                  <Progress value={totalStamps > 0 ? 60 : 0} className="h-2 bg-blue-400" />
                  <p className="text-xs text-blue-100 mt-1">Sigue acumulando</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Mis Negocios y Recompensas
              </CardTitle>
              <CardDescription>Negocios donde tienes stamps acumulados y recompensas disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subscriptionsData.subscriptions.length > 0 ? (
                  subscriptionsData.subscriptions.map((subscription, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{subscription?.business?.businessName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subscription?.business?.businessCategory} • {subscription?.business?.city}
                          </p>
                        </div>
                        <Badge variant="secondary">{subscription?.totalStamps} stamps</Badge>
                      </div>

                      {subscription?.rewards?.length !== undefined && subscription?.rewards?.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Recompensas Disponibles:</h5>
                          <div className="space-y-2">
                            {subscription?.rewards?.slice(0, 2).map((reward, rewardIndex) => (
                              <div key={rewardIndex} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{reward.name}</span>
                                  <span className="text-xs text-gray-500">{reward.requiredStamps} stamps</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Progress
                                    value={(reward.progress / reward.requiredStamps) * 100}
                                    className="h-1 flex-1 mr-2"
                                  />
                                  {reward.canRedeem ? (
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                      onClick={() =>
                                        handleRedeemReward(subscription?.business?.businessId, reward.rewardId)
                                      }
                                    >
                                      Canjear
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-gray-500">
                                      {reward.progress}/{reward.requiredStamps}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes stamps acumulados aún</p>
                    <Button variant="outline" className="bg-transparent">
                      <QrCode className="h-4 w-4 mr-2" />
                      Suscribirse a un Negocio
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-green-500" />
                Mis Suscripciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mySubscriptions.items.length > 0 ? (
                mySubscriptions.items.map((subscription: any, index: any) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {subscription.otherUser?.businessName || subscription.otherUser?.name || "Negocio"}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Negocio</p>
                      </div>
                      <Badge variant="outline">Suscrito</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Desde {new Date(subscription.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">No tienes suscripciones aún</p>
                  <Button size="sm" className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Encontrar Negocios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Resumen de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptionsData.subscriptions.length > 0 ? (
                  subscriptionsData.subscriptions.map((subscription, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{subscription?.business.businessName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {subscription?.totalStamps} stamps acumulados
                            </p>
                      </div>
                      <Badge variant="default">
                        {subscription?.rewards.filter((r) => r.canRedeem).length} canjeables
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalStamps > 0 ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">¡Stamps Acumulados!</h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Tienes {totalStamps} stamps en total. ¡Sigue acumulando para obtener recompensas!
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">¡Bienvenido!</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Comienza a acumular stamps visitando negocios y escaneando códigos QR
                  </p>
                </div>
              )}

              {mySubscriptions.items.length > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Suscripciones Activas</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Estás suscrito a {mySubscriptions.items.length} negocios. ¡Visítalos para ganar stamps!
                  </p>
                </div>
              )}

              {subscriptionsData.subscriptions.some((sub) => sub?.rewards.some((r) => r.canRedeem)) && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">¡Recompensas Disponibles!</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Tienes recompensas listas para canjear. ¡No las dejes pasar!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
