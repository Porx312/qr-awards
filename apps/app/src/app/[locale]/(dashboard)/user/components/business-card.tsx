"use client"

import * as React from "react"
import Image from "next/image"
import { Gift, Stamp, MapPin, TimerReset, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Separator } from "@v1/ui/separator"
import { Progress } from "@v1/ui/progress"
import { useToast } from "@v1/ui/use-toast"
import type { AggregatedSubscription } from "./types"
import { redeemRewardAction } from "../server-actions"
import { cn } from "@v1/ui/utils"
import PunchCard from "./punch-card"

type Props = {
  data: AggregatedSubscription
  layout?: "grid" | "list"
  onChange?: (updated: AggregatedSubscription) => void
}

export default function BusinessCard({ data, layout = "grid", onChange = () => {} }: Props) {
  const { toast } = useToast()
  const [pendingId, startTransition] = React.useTransition()

  const topReward = data.rewards[0]

if (!topReward) {
  return (
    <Card>
      <CardContent>
        <p>No hay recompensas disponibles.</p>
      </CardContent>
    </Card>
  );
}

  const completed = Math.min(topReward.progress, topReward.requiredStamps)
  const pct = Math.min(100, Math.round((topReward.progress / topReward.requiredStamps) * 100))

  function redeem(rewardId: string) {
    startTransition(async () => {
      try {
        const updated = await redeemRewardAction({
          clientId: data.clientId,
          businessId: data.business.businessId,
          rewardId,
        })
        onChange(updated)
        toast({
          title: "¡Recompensa canjeada!",
          description: "Tus sellos han sido utilizados para reclamar tu beneficio.",
        })
      } catch (e: any) {
        toast({
          title: "No se pudo canjear",
          description: e?.message ?? "Intenta de nuevo.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className={cn("overflow-hidden", layout === "list" && "flex flex-col sm:flex-row")}>
      <CardHeader className={cn(layout === "list" ? "sm:w-80" : "")}>
        <div className="flex items-center gap-3">
          <Image
            src={data.business.image ?? "/placeholder.svg?height=80&width=80&query=business%20logo"}
            alt={data.business.businessName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md border object-cover bg-muted"
          />
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{data.business.businessName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="secondary" className="whitespace-nowrap">
                {data.business.businessCategory}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {data.business.city}
              </span>
            </CardDescription>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Stamp className="h-4 w-4" /> {data.totalStamps} sello{data.totalStamps === 1 ? "" : "s"} acumulado
            {data.totalStamps === 1 ? "" : "s"}
          </span>
          {data.rewards.length > 1 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Gift className="h-4 w-4" /> {data.rewards.length} recompensa{data.rewards.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </CardHeader>

      <Separator className={cn(layout === "list" ? "hidden sm:block" : "hidden")} orientation="vertical" />

      <CardContent className={cn("pt-0 sm:pt-0", layout === "list" ? "sm:flex-1" : "")}>
        <div className={cn("grid gap-4", layout === "list" ? "sm:grid-cols-[1fr_.9fr]" : "")}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Próxima recompensa
              </div>
              {topReward.validUntil && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <TimerReset className="h-3.5 w-3.5" />
                  Vence: {new Date(topReward.validUntil).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{topReward.name}</div>
                  {topReward.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">{topReward.description}</div>
                  )}
                </div>
                <Badge variant="outline">
                  {completed}/{topReward.requiredStamps}
                </Badge>
              </div>

              <div className="mt-3">
                <PunchCard required={topReward.requiredStamps} completed={completed} />
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={pct} className="h-2" />
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!topReward.canRedeem || !!pendingId}
                    onClick={() => redeem(topReward.rewardId)}
                  >
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    {topReward.canRedeem ? "Canjear recompensa" : "Aún no disponible"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Otras recompensas</div>
            <div className="grid gap-2">
              {data.rewards.slice(1).map((r) => {
                const done = Math.min(r.progress, r.requiredStamps)
                const pct2 = Math.min(100, Math.round((r.progress / r.requiredStamps) * 100))
                return (
                  <div key={r.rewardId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{r.name}</div>
                        {r.description && <div className="text-xs text-muted-foreground truncate">{r.description}</div>}
                      </div>
                      <Badge variant="outline">
                        {done}/{r.requiredStamps}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={pct2} className="h-2" />
                      <span className="text-xs text-muted-foreground">{pct2}%</span>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!r.canRedeem || !!pendingId}
                        onClick={() => redeem(r.rewardId)}
                      >
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        {r.canRedeem ? "Canjear" : "Progresando..."}
                      </Button>
                    </div>
                  </div>
                )
              })}
              {data.rewards.length <= 1 && (
                <div className="text-xs text-muted-foreground">Este negocio tiene una única recompensa activa.</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
