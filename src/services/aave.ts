import type { Address } from "viem"

import type { ChainDeploy } from "@/config/deploys"
import { getPublicClient } from "@/lib/chains"

const RESERVES_QUERY = `
  query GetAaveReserves($chainId: Int!, $marketAddress: String!) {
    market(request: { address: $marketAddress, chainId: $chainId }) {
      reserves {
        underlyingToken { address symbol name decimals }
        aToken { address symbol }
        supplyInfo { apy { value } }
        size { usd }
        borrowInfo { availableLiquidity { usd } }
      }
    }
  }
`

type AaveGqlReserve = {
  underlyingToken: {
    address: string
    symbol: string
    name: string
    decimals: number
  }
  aToken: { address: string; symbol: string }
  supplyInfo: { apy: { value: string } | null } | null
  size: { usd: string } | null
  borrowInfo: { availableLiquidity: { usd: string } | null } | null
}

export type AaveReserve = {
  underlyingAsset: Address
  aTokenAddress: Address
  symbol: string
  name: string
  decimals: number
  supplyApy: number | null
  totalSuppliedUsd: number | null
  liquidityUsd: number | null
}

export type AavePosition = {
  underlyingAsset: Address
  aTokenAddress: Address
  symbol: string
  decimals: number
  supplyBalanceRaw: bigint
  supplyBalanceUsd: number | null
  supplyApy: number | null
}

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

async function fetchReservesRaw(deploy: ChainDeploy): Promise<AaveGqlReserve[]> {
  const svc = deploy.services.aave
  const res = await fetch(svc.graphqlEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RESERVES_QUERY,
      variables: {
        chainId: deploy.chain.id,
        marketAddress: svc.poolAddress,
      },
    }),
  })
  if (!res.ok) throw new Error(`Aave API ${res.status}: ${res.statusText}`)
  const json = (await res.json()) as {
    data?: { market?: { reserves?: AaveGqlReserve[] } | null }
    errors?: { message: string }[]
  }
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data?.market?.reserves ?? []
}

function mapReserve(r: AaveGqlReserve): AaveReserve {
  return {
    underlyingAsset: r.underlyingToken.address as Address,
    aTokenAddress: r.aToken.address as Address,
    symbol: r.underlyingToken.symbol,
    name: r.underlyingToken.name,
    decimals: r.underlyingToken.decimals,
    supplyApy: r.supplyInfo?.apy?.value ? parseFloat(r.supplyInfo.apy.value) : null,
    totalSuppliedUsd: r.size?.usd ? parseFloat(r.size.usd) : null,
    liquidityUsd: r.borrowInfo?.availableLiquidity?.usd
      ? parseFloat(r.borrowInfo.availableLiquidity.usd)
      : null,
  }
}

export async function fetchAaveReserves(deploy: ChainDeploy): Promise<AaveReserve[]> {
  const reserves = await fetchReservesRaw(deploy)
  return reserves
    .filter(
      (r) =>
        r.underlyingToken.address.toLowerCase() ===
        deploy.primaryAsset.address.toLowerCase(),
    )
    .map(mapReserve)
}

export async function fetchAavePositions(deploy: ChainDeploy): Promise<AavePosition[]> {
  const reserves = await fetchReservesRaw(deploy)
  const primary = reserves.filter(
    (r) =>
      r.underlyingToken.address.toLowerCase() ===
      deploy.primaryAsset.address.toLowerCase(),
  )
  if (primary.length === 0) return []

  const client = getPublicClient(deploy)
  const balances = await Promise.all(
    primary.map((r) =>
      client.readContract({
        address: r.aToken.address as Address,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf",
        args: [deploy.poolLogic],
      }),
    ),
  )

  return primary
    .map((r, i) => {
      const raw = balances[i] as bigint
      if (raw === 0n) return null
      const units = Number(raw) / 10 ** r.underlyingToken.decimals
      return {
        underlyingAsset: r.underlyingToken.address as Address,
        aTokenAddress: r.aToken.address as Address,
        symbol: r.underlyingToken.symbol,
        decimals: r.underlyingToken.decimals,
        supplyBalanceRaw: raw,
        supplyBalanceUsd: deploy.primaryAsset.treatAsUsd ? units : null,
        supplyApy: r.supplyInfo?.apy?.value ? parseFloat(r.supplyInfo.apy.value) : null,
      }
    })
    .filter((p): p is AavePosition => p !== null)
}
