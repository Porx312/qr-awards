import type { ClientSubscriptions, AggregatedSubscription, Reward, Stamp, Subscription, User } from "./types"

// Mock "DB"
const users: User[] = [
  { _id: "client_1", name: "María", role: "client" },
  {
    _id: "biz_1",
    role: "business",
    businessName: "Licería & Co. Coffee House",
    businessCategory: "Cafetería",
    city: "Madrid",
    image: "/coffee-shop-logo.png",
  },
  {
    _id: "biz_2",
    role: "business",
    businessName: "Pan del Barrio",
    businessCategory: "Panadería",
    city: "Barcelona",
    image: "/bakery-logo.png",
  },
  {
    _id: "biz_3",
    role: "business",
    businessName: "Green Fit",
    businessCategory: "Smoothies",
    city: "Valencia",
    image: "/placeholder-iwdpm.png",
  },
]

const rewards: Reward[] = [
  {
    _id: "r1",
    businessId: "biz_1",
    name: "Café gratis",
    description: "Tu 9º café va por la casa",
    requiredStamps: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    _id: "r2",
    businessId: "biz_1",
    name: "Tostada 50% DTO",
    requiredStamps: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    _id: "r3",
    businessId: "biz_2",
    name: "Baguette gratis",
    requiredStamps: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    _id: "r4",
    businessId: "biz_3",
    name: "Smoothie mediano gratis",
    requiredStamps: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    _id: "r5",
    businessId: "biz_3",
    name: "Topping extra",
    requiredStamps: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
]

let stamps: Stamp[] = [
  // Licería
  {
    _id: "s1",
    clientId: "client_1",
    businessId: "biz_1",
    quantity: 3,
    grantedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    _id: "s2",
    clientId: "client_1",
    businessId: "biz_1",
    quantity: 2,
    grantedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  // Pan del Barrio
  {
    _id: "s3",
    clientId: "client_1",
    businessId: "biz_2",
    quantity: 4,
    grantedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  // Green Fit
  {
    _id: "s4",
    clientId: "client_1",
    businessId: "biz_3",
    quantity: 2,
    grantedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
]

const subscriptions: Subscription[] = [
  { _id: "sub1", clientId: "client_1", businessId: "biz_1", subscribedAt: Date.now() - 1000 * 60 * 60 * 24 * 15 },
  { _id: "sub2", clientId: "client_1", businessId: "biz_2", subscribedAt: Date.now() - 1000 * 60 * 60 * 24 * 12 },
  { _id: "sub3", clientId: "client_1", businessId: "biz_3", subscribedAt: Date.now() - 1000 * 60 * 60 * 24 * 8 },
]

// Helpers
function sumStamps(clientId: string, businessId: string) {
  return stamps
    .filter((s) => s.clientId === clientId && s.businessId === businessId)
    .reduce((acc, s) => acc + s.quantity, 0)
}

function bizOf(id: string) {
  return users.find((u) => u._id === id && u.role === "business")
}

export async function getClientSubscriptions(clientId: string): Promise<ClientSubscriptions> {
  const subs = subscriptions.filter((s) => s.clientId === clientId)
  const items: AggregatedSubscription[] = subs.map((sub) => {
    const biz = bizOf(sub.businessId)!
    const bizRewards = rewards.filter((r) => r.businessId === sub.businessId)
    const total = sumStamps(clientId, sub.businessId)

    const aggRewards = bizRewards
      .map((r) => ({
        rewardId: r._id,
        name: r.name,
        description: r.description,
        requiredStamps: r.requiredStamps,
        validUntil: r.validUntil,
        progress: total,
        canRedeem: total >= r.requiredStamps,
      }))
      // Orden: la más “barata” primero
      .sort((a, b) => a.requiredStamps - b.requiredStamps)

    return {
      clientId,
      business: {
        businessId: sub.businessId,
        businessName: biz.businessName || "Negocio",
        businessCategory: biz.businessCategory || "General",
        city: biz.city || "—",
        image: biz.image,
      },
      totalStamps: total,
      rewards: aggRewards,
    }
  })

  // Simular latencia
  await new Promise((r) => setTimeout(r, 250))
  return { clientId, subscriptions: items }
}

// Simula un canje: resta los sellos necesarios del total del cliente para ese negocio
export async function redeemReward(
  clientId: string,
  businessId: string,
  rewardId: string,
): Promise<AggregatedSubscription> {
  const reward = rewards.find((r) => r._id === rewardId && r.businessId === businessId)
  if (!reward) throw new Error("Recompensa no encontrada")

  const total = sumStamps(clientId, businessId)
  if (total < reward.requiredStamps) {
    throw new Error("No tienes suficientes sellos para canjear esta recompensa")
  }

  // Lógica simple: consumir sellos restando de los últimos registros primero
  let toConsume = reward.requiredStamps
  // Ordenar por fecha descendente para consumir los más recientes
  const clientStamps = stamps
    .filter((s) => s.clientId === clientId && s.businessId === businessId)
    .sort((a, b) => b.grantedAt - a.grantedAt)

  for (const s of clientStamps) {
    if (toConsume <= 0) break
    const consume = Math.min(s.quantity, toConsume)
    s.quantity -= consume
    toConsume -= consume
  }
  // Eliminar registros con 0
  stamps = stamps.filter((s) => s.quantity > 0)

  // devolver estado actualizado para ese negocio
  const updatedTotal = sumStamps(clientId, businessId)
  const biz = bizOf(businessId)!
  const bizRewards = rewards.filter((r) => r.businessId === businessId)
  const aggRewards = bizRewards
    .map((r) => ({
      rewardId: r._id,
      name: r.name,
      description: r.description,
      requiredStamps: r.requiredStamps,
      validUntil: r.validUntil,
      progress: updatedTotal,
      canRedeem: updatedTotal >= r.requiredStamps,
    }))
    .sort((a, b) => a.requiredStamps - b.requiredStamps)

  await new Promise((r) => setTimeout(r, 300))
  return {
    clientId,
    business: {
      businessId,
      businessName: biz.businessName || "Negocio",
      businessCategory: biz.businessCategory || "General",
      city: biz.city || "—",
      image: biz.image,
    },
    totalStamps: updatedTotal,
    rewards: aggRewards,
  }
}
