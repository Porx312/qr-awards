"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@v1/ui/dropdown-menu"
import { MoreHorizontalIcon, EditIcon, Trash2Icon, CalendarIcon, StampIcon } from 'lucide-react'
import { Reward } from "@v1/backend/convex/utils/reward"

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
}

// Esta función sigue usando Intl.DateTimeFormat para formatear la fecha para la visualización
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function RewardCard({ reward, onEdit, onDelete }: RewardCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{reward.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(reward)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(reward._id)} className="text-red-600 focus:text-red-600">
                <Trash2Icon className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {reward.description && <CardDescription className="text-sm">{reward.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <StampIcon className="mr-1.5 h-4 w-4" />
          <span>{reward.requiredStamps} sellos requeridos</span>
        </div>
        {reward.validUntil && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            <span>Válido hasta: {formatDate(new Date(reward.validUntil))}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 text-xs text-muted-foreground">
        Creado el: {formatDate(new Date(reward.createdAt))}
      </CardFooter>
    </Card>
  )
}
