
"use client"

import { cn } from "@v1/ui/utils"

type Props = {
  required: number
  completed: number
  className?: string
}

export default function PunchCard({ required, completed, className }: Props) {
  const stamps = Array.from({ length: required }, (_, i) => i < completed)

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {stamps.map((filled, index) => (
        <div
          key={index}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
            filled
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-background border-muted-foreground/30 text-muted-foreground",
          )}
        >
          {filled ? "✓" : index + 1}
        </div>
      ))}
    </div>
  )
}
