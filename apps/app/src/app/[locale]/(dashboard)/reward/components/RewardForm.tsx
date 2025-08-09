"use client"

import { CreateRewardFormInput, UpdateRewardFormInput, createRewardFormSchema, updateRewardFormSchema, Reward } from "@v1/backend/convex/utils/reward"
import { cn } from "@v1/ui/utils"
import { useState, useEffect } from "react"
import { Button } from "@v1/ui/button"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Textarea } from "@v1/ui/textarea"
// Eliminadas importaciones de Popover y Calendar de shadcn/ui
import { Loader2Icon } from 'lucide-react'
import { z } from "zod" // Importa Zod para la validación manual

interface RewardFormProps {
  initialData?: Reward | null;
  onSubmit: (data: CreateRewardFormInput | UpdateRewardFormInput) => Promise<void>;
  isLoading: boolean;
}

// Función para formatear fechas para visualización (usada en RewardCard)
// No es necesaria aquí para el input type="date"
// function formatDate(date: Date): string {
//   return new Intl.DateTimeFormat('es', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   }).format(date);
// }

export function RewardForm({ initialData, onSubmit, isLoading }: RewardFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [requiredStamps, setRequiredStamps] = useState<string>("")
  // validUntil ahora es un string (YYYY-MM-DD) o undefined
  const [validUntil, setValidUntil] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<z.ZodIssue[] | null>(null)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
      setRequiredStamps(initialData.requiredStamps.toString())
      // Si initialData.validUntil existe, úsalo directamente (ya es YYYY-MM-DD)
      setValidUntil(initialData.validUntil || undefined)
    } else {
      // Reset form for creation
      setName("")
      setDescription("")
      setRequiredStamps("")
      setValidUntil(undefined)
    }
    setErrors(null); // Clear errors on initialData change
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null); // Clear previous errors

    const formData = {
      name: name,
      description: description || undefined,
      requiredStamps: requiredStamps, // Zod will coerce this to number
      validUntil: validUntil, // Ya es un string YYYY-MM-DD o undefined
    }

    const schema = initialData ? updateRewardFormSchema : createRewardFormSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }

    // If validation passes, call the onSubmit prop
    await onSubmit(result.data as CreateRewardFormInput | UpdateRewardFormInput);
  }

  const getErrorMessage = (path: string) => {
    return errors?.find(err => err.path.includes(path))?.message;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre del Premio</Label>
        <Input
          id="name"
          placeholder="Ej: Café Gratis"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {getErrorMessage("name") && (
          <p className="text-red-500 text-sm">{getErrorMessage("name")}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Ej: Un café de tu elección al completar la tarjeta."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {getErrorMessage("description") && (
          <p className="text-red-500 text-sm">{getErrorMessage("description")}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="requiredStamps">Sellos Requeridos</Label>
        <Input
          id="requiredStamps"
          type="number"
          placeholder="Ej: 10"
          value={requiredStamps}
          onChange={(e) => setRequiredStamps(e.target.value)}
          min="1"
        />
        {getErrorMessage("requiredStamps") && (
          <p className="text-red-500 text-sm">{getErrorMessage("requiredStamps")}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="validUntil">Válido Hasta (Opcional)</Label>
        {/* Reemplazado Popover y Calendar por input type="date" */}
        <Input
          id="validUntil"
          type="date"
          value={validUntil || ""} // Asegura que el valor sea una cadena vacía si es undefined
          onChange={(e) => setValidUntil(e.target.value || undefined)}
          className={cn(
            "w-full justify-start text-left font-normal",
            !validUntil && "text-muted-foreground"
          )}
        />
        {getErrorMessage("validUntil") && (
          <p className="text-red-500 text-sm">{getErrorMessage("validUntil")}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Guardar Cambios" : "Crear Premio"}
      </Button>
    </form>
  )
}
