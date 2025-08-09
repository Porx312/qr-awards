"use client"

import { useState } from "react"
import { Button } from "@v1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@v1/ui/dialog"
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { toast } from "@v1/ui/use-toast"

// --- Start: Real Convex Hooks and API Imports ---
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { CreateRewardFormInput, Reward, UpdateRewardFormInput } from "@v1/backend/convex/utils/reward"
import { api } from "@v1/backend/convex/_generated/api"
import { RewardCard } from "./components/RewardCard"
import { RewardForm } from "./components/RewardForm"
// --- End: Real Convex Hooks and API Imports ---


export default function RewardsDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  // --- NUEVOS ESTADOS DE CARGA MANUALES ---
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [isUpdatingReward, setIsUpdatingReward] = useState(false);
  const [isDeletingReward, setIsDeletingReward] = useState(false);
  // --- FIN NUEVOS ESTADOS DE CARGA MANUALES ---

  // Obtén el estado de autenticación general
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Obtén el objeto de usuario completo de Convex.
  // Esta query solo se ejecutará si el usuario está autenticado.
  const user = useQuery(api.users.getUser, isAuthenticated ? {} : "skip");

  // Ahora, el userId se obtiene del objeto 'user'
  const userId = user?._id;

  // Usa useQuery para obtener los premios.
  // La query solo se ejecutará si userId es un valor válido (no null/undefined).
  // Si userId es null, se pasa "skip" para evitar que la query se ejecute.
  const rewards = useQuery(
    api.rewards.getRewardsByBusiness,
    userId ? { businessId: userId } : "skip"
  );

  // Declaración de useMutation sin desestructuración
  const createReward = useMutation(api.rewards.createReward);
  const updateReward = useMutation(api.rewards.updateReward);
  const deleteReward = useMutation(api.rewards.deleteReward);

  const handleCreateReward = async (formData: CreateRewardFormInput | UpdateRewardFormInput) => {
    const createData = formData as CreateRewardFormInput;
    setIsCreatingReward(true); // Inicia la carga
    try {
      await createReward(createData); // Llama a la función de mutación
      toast({
        title: "Premio creado",
        description: "El nuevo premio ha sido añadido exitosamente.",
      });
      setIsFormOpen(false);
    } catch (err) {
      toast({
        title: "Error al crear premio",
        description: (err as Error).message || "Hubo un problema al crear el premio.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingReward(false); // Finaliza la carga
    }
  };

  const handleUpdateReward = async (formData: CreateRewardFormInput | UpdateRewardFormInput) => {
    if (!editingReward) return;
    const updateData = formData as UpdateRewardFormInput;
    setIsUpdatingReward(true); // Inicia la carga
    try {
      await updateReward({ rewardId: editingReward._id, ...updateData }); // Llama a la función de mutación
      toast({
        title: "Premio actualizado",
        description: "El premio ha sido modificado exitosamente.",
      });
      setIsFormOpen(false);
      setEditingReward(null);
    } catch (err) {
      toast({
        title: "Error al actualizar premio",
        description: (err as Error).message || "Hubo un problema al actualizar el premio.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingReward(false); // Finaliza la carga
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este premio? Esta acción no se puede deshacer.")) {
      return;
    }
    setIsDeletingReward(true); // Inicia la carga
    try {
      await deleteReward({ rewardId }); // Llama a la función de mutación
      toast({
        title: "Premio eliminado",
        description: "El premio ha sido eliminado exitosamente.",
      });
    } catch (err) {
      toast({
        title: "Error al eliminar premio",
        description: (err as Error).message || "Hubo un problema al eliminar el premio.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingReward(false); // Finaliza la carga
    }
  };

  const openCreateForm = () => {
    setEditingReward(null);
    setIsFormOpen(true);
  };

  const openEditForm = (reward: Reward) => {
    setEditingReward(reward);
    setIsFormOpen(true);
  };

  // El estado `rewards` de useQuery puede ser `undefined` mientras carga o si la query se "salta"
  const isLoadingContent = isAuthLoading || rewards === undefined;

  if (!isAuthenticated && !isAuthLoading) {
    // Si no está autenticado y ya terminó de cargar la autenticación, puedes redirigir o mostrar un mensaje
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
        Necesitas iniciar sesión para gestionar premios.
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle className="text-3xl font-bold">Gestión de Premios</CardTitle>
            <CardDescription>Crea y administra los premios de fidelidad para tus clientes.</CardDescription>
          </div>
          <Button onClick={openCreateForm} disabled={isLoadingContent}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Crear Nuevo Premio
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingContent ? (
            <div className="flex items-center justify-center h-48">
              <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Cargando premios...</span>
            </div>
          ) : rewards && rewards.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rewards.map((reward: Reward) => (
                <RewardCard
                  key={reward._id}
                  reward={reward}
                  onEdit={() => openEditForm(reward)}
                  onDelete={() => handleDeleteReward(reward._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="text-lg mb-2">No tienes premios creados aún.</p>
              <p>Haz clic en "Crear Nuevo Premio" para empezar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingReward ? "Editar Premio" : "Crear Nuevo Premio"}</DialogTitle>
            <DialogDescription>
              {editingReward
                ? "Modifica los detalles de tu premio existente."
                : "Define un nuevo premio para tus clientes."}
            </DialogDescription>
          </DialogHeader>
          <RewardForm
            initialData={editingReward}
            onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
            isLoading={isCreatingReward || isUpdatingReward || isDeletingReward} // Usa los estados de carga manuales
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
