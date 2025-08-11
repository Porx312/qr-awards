export type Role = "business" | "client"

export type User = {
  _id: string
  name?: string
  email?: string
  phone?: string
  username?: string
  image?: string
  role?: Role
  businessName?: string
  location?: string
  city?: string
  exactAddress?: string
  businessCategory?: string
  qrCode?: string
  createdAt?: number
}

export type Reward = {
  _id: string
  businessId: string
  name: string
  description?: string
  requiredStamps: number
  validUntil?: string // ISO
  createdAt: number
}

export type Stamp = {
  _id: string
  clientId: string
  businessId: string
  quantity: number
  grantedAt: number
}

export type Subscription = {
  _id: string
  clientId: string
  businessId: string
  subscribedAt: number
}

export type AggregatedReward = {
  rewardId: string
  name: string
  description?: string
  requiredStamps: number
  validUntil?: string
  progress: number // sellos actuales del cliente aplicables a esta recompensa
  canRedeem: boolean
}

export type AggregatedBusiness = {
  businessId: string
  businessName: string
  businessCategory: string
  city: string
  image?: string
}

export type AggregatedSubscription = {
  clientId: string
  business: AggregatedBusiness
  totalStamps: number
  rewards: AggregatedReward[]
}

export type ClientSubscriptions = {
  clientId: string
  subscriptions: AggregatedSubscription[]
}
