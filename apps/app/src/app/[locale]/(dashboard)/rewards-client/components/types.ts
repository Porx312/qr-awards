import { Id } from "@v1/backend/convex/_generated/dataModel"

export type Role = "business" | "client"

export type User = {
  _id: Id<"users">
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
  _id: Id<"rewards">
  businessId: Id<"users">
  name: string
  description?: string
  requiredStamps: number
  validUntil?: string // ISO
  createdAt: number
}

export type Stamp = {
  _id: Id<"stamps">
  clientId: Id<"users">
  businessId: Id<"users">
  quantity: number
  grantedAt: number
}

export type Subscription = {
  _id: Id<"subscriptions">
  clientId: Id<"users">
  businessId: Id<"users">
  subscribedAt: number
}

export type AggregatedReward = {
  rewardId: Id<"rewards">
  name: string
  description?: string
  requiredStamps: number
  validUntil?: string
  progress: number
  canRedeem: boolean
}

export type AggregatedBusiness = {
  businessId: Id<"users">
  businessName: string
  businessCategory: string
  city: string
  image?: string
}

export type AggregatedSubscription = {
  clientId: Id<"users">
  business: AggregatedBusiness
  totalStamps: number
  rewards: AggregatedReward[]
}

export type ClientSubscriptions = {
  clientId: Id<"users">
  subscriptions: AggregatedSubscription[]
}
