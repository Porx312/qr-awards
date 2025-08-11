"use client"

import { cn } from "@v1/ui/utils"
import { Check } from "lucide-react"

type PunchCardProps = {
  required?: number
  completed?: number
  columns?: number
  size?: "sm" | "md"
}

export default function PunchCard({ required = 8, completed = 0, columns = 4, size = "md" }: PunchCardProps) {
  const items = Array.from({ length: required }, (_, i) => i + 1)
  const cell = size === "sm" ? "h-9" : "h-11"

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="list"
      aria-label="Progreso de sellos"
    >
      {items.map((n) => {
        const done = n <= completed
        return (
          <div
            key={n}
            role="listitem"
            className={cn(
              "rounded-full border text-xs flex items-center justify-center select-none",
              cell,
              done ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground",
            )}
            aria-checked={done}
          >
            {done ? <Check className="h-4 w-4" /> : n.toString().padStart(2, "0")}
          </div>
        )
      })}
    </div>
  )
}
