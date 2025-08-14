"use client"

import { useQuery, useMutation } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Progress } from "@v1/ui/progress"
import { CreditCard, Gift, Calendar, Trophy, Bell, QrCode, Users, Loader2, Sparkles, Star, TrendingUp } from "lucide-react"
import { api } from "@v1/backend/convex/_generated/api"
import { Id } from "@v1/backend/convex/_generated/dataModel"
import QrCarduser from "../Qr/QrCard"

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
 const progressValue = Math.min((totalStamps / 10) * 100, 100) // Assuming 10 stamps 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Escanear QR
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
     <div className="flex w-full justify-between mb-8 gap-4 items-center flex-wrap md:flex-nowrap">
        <Card className="relative w-full overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-2xl border-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white text-xl font-bold">Tu StampMe Card</CardTitle>
                <CardDescription className="text-emerald-100 font-medium">
                  {totalBusinesses} negocios suscritos
                </CardDescription>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Stamps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-200" />
                <p className="text-emerald-100 text-sm font-medium">Total Stamps</p>
              </div>
              <p className="text-4xl font-bold tracking-tight">{totalStamps}</p>
              <p className="text-xs text-emerald-200">En todos los negocios</p>
            </div>

            {/* Negocios Suscritos */}
            <div className="space-y-2">
              <p className="text-emerald-100 text-sm font-medium">Negocios Suscritos</p>
              <p className="text-4xl font-bold tracking-tight">{totalBusinesses}</p>
              <p className="text-xs text-emerald-200">Activos</p>
            </div>

            {/* Próximo Canje */}
            <div className="space-y-2">
              <p className="text-emerald-100 text-sm font-medium">Próximo Canje</p>
              <p className="text-lg font-semibold leading-tight">
                {totalStamps > 0 ? "Revisa tus recompensas" : "Acumula más stamps"}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>Progreso</span>
                  <span>{Math.min(totalStamps, 10)}/10</span>
                </div>
                <Progress value={progressValue} className="h-3 bg-white/20 rounded-full overflow-hidden" />
                <p className="text-xs text-emerald-100 font-medium">
                  {totalStamps >= 10 ? "¡Recompensa disponible!" : "Sigue acumulando"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <QrCarduser defaultOwnerUserId={userId} />
    
     </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="relative">
            <CardTitle className="flex items-center text-emerald-800 dark:text-emerald-200">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Mis Negocios y Recompensas
            </CardTitle>
            <CardDescription className="text-emerald-700/70 dark:text-emerald-300/70">
              Negocios donde tienes stamps acumulados y recompensas disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-6">
              {subscriptionsData.subscriptions.length > 0 ? (
                subscriptionsData.subscriptions.map((subscription, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {subscription?.business?.businessName}
                        </h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          {subscription?.business?.businessCategory} • {subscription?.business?.city}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {subscription?.totalStamps} stamps
                      </Badge>
                    </div>

                    {subscription?.rewards?.length !== undefined && subscription?.rewards?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-sm mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                          <Star className="h-4 w-4 mr-2 text-amber-500" />
                          Recompensas Disponibles:
                        </h5>
                        <div className="space-y-3">
                          {subscription?.rewards?.slice(0, 2).map((reward, rewardIndex) => (
                            <div
                              key={rewardIndex}
                              className="p-3 bg-gradient-to-r from-gray-50 to-emerald-50/50 dark:from-gray-700 dark:to-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">{reward.name}</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                                  {reward.requiredStamps} stamps
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <Progress
                                  value={(reward.progress / reward.requiredStamps) * 100}
                                  className="h-2 flex-1 mr-3"
                                />
                                {reward.canRedeem ? (
                                  <Button
                                    size="sm"
                                    className="h-8 px-4 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md"
                                    onClick={() =>
                                      handleRedeemReward(subscription?.business?.businessId, reward.rewardId)
                                    }
                                  >
                                    Canjear
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
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
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No tienes stamps acumulados aún</p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-lg">
                    <QrCode className="h-4 w-4 mr-2" />
                    Suscribirse a un Negocio
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          </Card>

           <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 dark:from-teal-950/50 dark:via-emerald-950/50 dark:to-green-950/50 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10" />

          <CardHeader className="relative">
            <CardTitle className="flex items-center text-teal-800 dark:text-teal-200">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg mr-3">
                <Gift className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              Mis Suscripciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {mySubscriptions.items.length > 0 ? (
              mySubscriptions.items.map((subscription: any, index: any) => (
                <div
                  key={index}
                  className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-teal-200/50 dark:border-teal-800/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 rounded-lg flex items-center justify-center">
                      <Gift className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {subscription.otherUser?.businessName || subscription.otherUser?.name || "Negocio"}
                      </h4>
                      <p className="text-xs text-teal-600 dark:text-teal-400">Negocio</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0">
                      Suscrito
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full inline-block">
                    Desde {new Date(subscription.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No tienes suscripciones aún</p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-0"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Encontrar Negocios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
           <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full -translate-y-12 translate-x-12" />

          <CardHeader className="relative">
            <CardTitle className="flex items-center text-cyan-800 dark:text-cyan-200">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {subscriptionsData.subscriptions.length > 0 ? (
                subscriptionsData.subscriptions.map((subscription, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {subscription?.business.businessName}
                        </p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400">
                          {subscription?.totalStamps} stamps acumulados
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                      {subscription?.rewards.filter((r) => r.canRedeem).length} canjeables
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

         <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-red-950/50 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -translate-y-10 translate-x-10" />

          <CardHeader className="relative">
            <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg mr-3">
                <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {totalStamps > 0 ? (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  ¡Stamps Acumulados!
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Tienes {totalStamps} stamps en total. ¡Sigue acumulando para obtener recompensas!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  ¡Bienvenido!
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Comienza a acumular stamps visitando negocios y escaneando códigos QR
                </p>
              </div>
            )}

            {mySubscriptions.items.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800/50 rounded-xl">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  Suscripciones Activas
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Estás suscrito a {mySubscriptions.items.length} negocios. ¡Visítalos para ganar stamps!
                </p>
              </div>
            )}

            {subscriptionsData.subscriptions.some((sub) => sub?.rewards.some((r) => r.canRedeem)) && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800/50 rounded-xl">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  ¡Recompensas Disponibles!
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
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
