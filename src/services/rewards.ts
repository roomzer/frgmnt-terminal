import type { ChainDeploy } from "@/config/deploys"
import { getPublicClient } from "@/lib/chains"
import { fromRaw } from "@/lib/format"

const POOL_LOGIC_REWARDS_ABI = [
  {
    name: "totalRewardAccrued",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalRewardHarvested",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalPerformanceFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalManagementFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

export type RewardsSnapshot = {
  /** Cumulative rewards credited to the pool since inception (fUSD). */
  totalAccrued: number
  /** Cumulative rewards already harvested out of the pool (fUSD). */
  totalHarvested: number
  /** Currently pending at the pool level (accrued − harvested) (fUSD). */
  pending: number
  /** Cumulative performance fee accrued to the manager (fUSD). */
  totalPerformanceFee: number
  /** Cumulative management fee accrued to the manager (fUSD). */
  totalManagementFee: number
  /** Pending / accrued (0..1). */
  pendingPct: number
}

export async function fetchRewardsSnapshot(
  deploy: ChainDeploy
): Promise<RewardsSnapshot> {
  const tokens = deploy.tokens
  if (!tokens) {
    throw new Error(`Deploy ${deploy.key} has no protocol tokens configured`)
  }
  const client = getPublicClient(deploy)
  const [accrued, harvested, perfFee, mgmtFee] = await Promise.all([
    client.readContract({
      address: tokens.sfusd.address,
      abi: POOL_LOGIC_REWARDS_ABI,
      functionName: "totalRewardAccrued",
    }),
    client.readContract({
      address: tokens.sfusd.address,
      abi: POOL_LOGIC_REWARDS_ABI,
      functionName: "totalRewardHarvested",
    }),
    client.readContract({
      address: tokens.sfusd.address,
      abi: POOL_LOGIC_REWARDS_ABI,
      functionName: "totalPerformanceFee",
    }),
    client.readContract({
      address: tokens.sfusd.address,
      abi: POOL_LOGIC_REWARDS_ABI,
      functionName: "totalManagementFee",
    }),
  ])

  const d = tokens.fusd.decimals
  const totalAccrued = fromRaw(accrued, d)
  const totalHarvested = fromRaw(harvested, d)
  const pending = Math.max(totalAccrued - totalHarvested, 0)
  return {
    totalAccrued,
    totalHarvested,
    pending,
    totalPerformanceFee: fromRaw(perfFee, d),
    totalManagementFee: fromRaw(mgmtFee, d),
    pendingPct: totalAccrued > 0 ? pending / totalAccrued : 0,
  }
}
