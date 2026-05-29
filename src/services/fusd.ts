import type { ChainDeploy } from "@/config/deploys"
import { getPublicClient } from "@/lib/chains"
import { fromRaw } from "@/lib/format"

const ERC20_VIEW_ABI = [
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

export type FusdSnapshot = {
  totalFusd: number
  stakedFusd: number
  unstakedFusd: number
  sfusdSupply: number
  /** fUSD held per sfUSD share. 1.0 at genesis, drifts up as rewards accrue. */
  exchangeRate: number
  /** Share of fUSD currently staked (0..1). */
  stakedPct: number
}

export async function fetchFusdSnapshot(
  deploy: ChainDeploy,
): Promise<FusdSnapshot> {
  const tokens = deploy.tokens
  if (!tokens) {
    throw new Error(`Deploy ${deploy.key} has no protocol tokens configured`)
  }
  const client = getPublicClient(deploy)
  const [totalFusdRaw, sfusdSupplyRaw, stakedRaw] = await Promise.all([
    client.readContract({
      address: tokens.fusd.address,
      abi: ERC20_VIEW_ABI,
      functionName: "totalSupply",
    }) as Promise<bigint>,
    client.readContract({
      address: tokens.sfusd.address,
      abi: ERC20_VIEW_ABI,
      functionName: "totalSupply",
    }) as Promise<bigint>,
    client.readContract({
      address: tokens.fusd.address,
      abi: ERC20_VIEW_ABI,
      functionName: "balanceOf",
      args: [tokens.sfusd.address],
    }) as Promise<bigint>,
  ])

  const totalFusd = fromRaw(totalFusdRaw, tokens.fusd.decimals)
  const sfusdSupply = fromRaw(sfusdSupplyRaw, tokens.sfusd.decimals)
  const stakedFusd = fromRaw(stakedRaw, tokens.fusd.decimals)
  const unstakedFusd = Math.max(totalFusd - stakedFusd, 0)
  const exchangeRate = sfusdSupply > 0 ? stakedFusd / sfusdSupply : 1
  const stakedPct = totalFusd > 0 ? stakedFusd / totalFusd : 0

  return {
    totalFusd,
    stakedFusd,
    unstakedFusd,
    sfusdSupply,
    exchangeRate,
    stakedPct,
  }
}
