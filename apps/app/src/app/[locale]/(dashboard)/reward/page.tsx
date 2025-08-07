"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@v1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@v1/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@v1/ui/dialog"
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { toast } from "@v1/ui/use-toast"
import { CreateRewardFormInput, UpdateRewardFormInput, Reward } from "@v1/backend/convex/utils/reward"
import { RewardCard } from "./components/RewardCard"
import { RewardForm } from "./components/RewardForm"

// --- Start: Simulated Convex Hooks and API (Replace with actual Convex imports) ---
// In a real Convex app, you would import these from your Convex client setup:
// import { useQuery, useMutation } from "@convex-dev/react";
// import { api } from "../../convex/_generated/api"; // Adjust path as needed

// Placeholder for Convex hooks
const useQuery = (queryFn: (...args: any[]) => Promise<any>, args: any[]) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0); // To manually trigger refetch

  const refetch = useCallback(() => {
    setRefetchIndex(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await queryFn(...args);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [queryFn, JSON.stringify(args), refetchIndex]); // Deep dependency check for args

  return { data, loading, error, refetch };
};

const useMutation = (mutationFn: (...args: any[]) => Promise<any>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
};

// Dummy Convex API calls (replace with actual Convex client calls)
// These functions simulate the behavior of your Convex API functions.
// In a real app, `api.rewards` would be imported from your Convex generated code.
const api = {
  rewards: {
    getRewardsByBusiness: async (args: { businessId: string }) => {
      console.log("Simulating getRewardsByBusiness for:", args.businessId);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Dummy data - in a real app, this would come from your Convex database
      const dummyRewards: Reward[] = [
        { _id: "reward1", _creationTime: Date.now(), businessId: args.businessId, name: "Café Gratis", description: "Un café gratis después de 10 sellos", requiredStamps: 10, validUntil: "2025-12-31", createdAt: Date.now() },
        { _id: "reward2", _creationTime: Date.now(), businessId: args.businessId, name: "Descuento 20%", description: "20% de descuento en tu próxima compra", requiredStamps: 5, validUntil: "2025-11-30", createdAt: Date.now() },
        { _id: "reward3", _creationTime: Date.now(), businessId: args.businessId, name: "Postre Gratis", description: "Un postre de tu elección con 15 sellos", requiredStamps: 15, validUntil: "2026-01-15", createdAt: Date.now() },
      ];
      return dummyRewards.filter(r => r.businessId === args.businessId);
    },
    createReward: async (args: CreateRewardFormInput) => {
      console.log("Simulating createReward:", args);
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simulate a new ID and return success
      return { id: `newReward_${Date.now()}`, message: "Premio creado exitosamente" };
    },
    updateReward: async (args: { rewardId: string } & UpdateRewardFormInput) => {
      console.log("Simulating updateReward:", args);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: "Premio actualizado exitosamente" };
    },
    deleteReward: async (args: { rewardId: string }) => {
      console.log("Simulating deleteReward:", args);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: "Premio eliminado exitosamente" };
    },
  }
};
// --- End: Simulated Convex Hooks and API ---


export default function RewardsDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  // IMPORTANT: Replace "dummyBusinessId123" with the actual authenticated businessId
  // In a real app, you'd get this from your auth context (e.g., useAuth().userId)
  const businessId = "dummyBusinessId123"

  const { data: rewards, loading, error, refetch } = useQuery(api.rewards.getRewardsByBusiness, [{ businessId }])
  const createRewardMutation = useMutation(api.rewards.createReward)
  const updateRewardMutation = useMutation(api.rewards.updateReward)
  const deleteRewardMutation = useMutation(api.rewards.deleteReward)

  // Modificado para aceptar el tipo de unión
  const handleCreateReward = async (formData: CreateRewardFormInput | UpdateRewardFormInput) => {
    // Sabemos que para la creación, formData será CreateRewardFormInput
    const createData = formData as CreateRewardFormInput;
    try {
      await createRewardMutation.mutate(createData)
      toast({
        title: "Premio creado",
        description: "El nuevo premio ha sido añadido exitosamente.",
      })
      setIsFormOpen(false)
      refetch() // Refresh the list of rewards
    } catch (err) {
      toast({
        title: "Error al crear premio",
        description: (err as Error).message || "Hubo un problema al crear el premio.",
        variant: "destructive",
      })
    }
  }

  // Modificado para aceptar el tipo de unión
  const handleUpdateReward = async (formData: CreateRewardFormInput | UpdateRewardFormInput) => {
    if (!editingReward) return
    // Sabemos que para la actualización, formData será UpdateRewardFormInput
    const updateData = formData as UpdateRewardFormInput;
    try {
      await updateRewardMutation.mutate({ rewardId: editingReward._id, ...updateData })
      toast({
        title: "Premio actualizado",
        description: "El premio ha sido modificado exitosamente.",
      })
      setIsFormOpen(false)
      setEditingReward(null)
      refetch() // Refresh the list of rewards
    } catch (err) {
      toast({
        title: "Error al actualizar premio",
        description: (err as Error).message || "Hubo un problema al actualizar el premio.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este premio? Esta acción no se puede deshacer.")) {
      return
    }
    try {
      await deleteRewardMutation.mutate({ rewardId })
      toast({
        title: "Premio eliminado",
        description: "El premio ha sido eliminado exitosamente.",
      })
      refetch() // Refresh the list of rewards
    } catch (err) {
      toast({
        title: "Error al eliminar premio",
        description: (err as Error).message || "Hubo un problema al eliminar el premio.",
        variant: "destructive",
      })
    }
  }

  const openCreateForm = () => {
    setEditingReward(null)
    setIsFormOpen(true)
  }

  const openEditForm = (reward: Reward) => {
    setEditingReward(reward)
    setIsFormOpen(true)
  }

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle className="text-3xl font-bold">Gestión de Premios</CardTitle>
            <CardDescription>Crea y administra los premios de fidelidad para tus clientes.</CardDescription>
          </div>
          <Button onClick={openCreateForm}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Crear Nuevo Premio
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Cargando premios...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error al cargar premios: {error.message}
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
            isLoading={createRewardMutation.loading || updateRewardMutation.loading}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
