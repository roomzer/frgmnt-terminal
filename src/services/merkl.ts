import type { ChainDeploy } from "@/config/deploys"

export type MerklReward = {
  tokenAddress: string
  symbol: string
  decimals: number
  priceUsd: number | null
  amount: bigint
  claimed: bigint
  pending: bigint
  claimable: bigint
}

type MerklTokenDto = {
  chainId: number
  address: string
  decimals: number
  symbol: string
  price: number | null
}

type MerklRewardDto = {
  amount: string
  claimed: string
  pending: string
  proofs: string[]
  token: MerklTokenDto
}

type MerklChainRewardsDto = {
  chain: { id: number }
  rewards: MerklRewardDto[]
}

export async function fetchMerklRewards(deploy: ChainDeploy): Promise<MerklReward[]> {
  const svc = deploy.services.merkl
  if (!svc) return []
  const url = `${svc.apiBase}/v4/users/${deploy.poolLogic}/rewards?chainId=${deploy.chain.id}&breakdownPage=0`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Merkl API ${res.status}: ${res.statusText}`)
  const data = (await res.json()) as MerklChainRewardsDto[]
  const entry = data.find((d) => d.chain?.id === deploy.chain.id)
  if (!entry) return []
  return entry.rewards.map((r) => {
    const amount = BigInt(r.amount)
    const claimed = BigInt(r.claimed)
    return {
      tokenAddress: r.token.address,
      symbol: r.token.symbol,
      decimals: r.token.decimals,
      priceUsd: r.token.price ?? null,
      amount,
      claimed,
      pending: BigInt(r.pending),
      claimable: amount > claimed ? amount - claimed : 0n,
    }
  })
}
