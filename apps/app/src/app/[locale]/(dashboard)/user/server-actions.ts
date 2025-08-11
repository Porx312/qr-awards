"use server"

import { redeemReward } from "./components/mock-data"
import type { AggregatedSubscription } from "./components/types"

export async function redeemRewardAction(input: { clientId: string; businessId: string; rewardId: string }) {
  const updated: AggregatedSubscription = await redeemReward(input.clientId, input.businessId, input.rewardId)
  return updated
}
