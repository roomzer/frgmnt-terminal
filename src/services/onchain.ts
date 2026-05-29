import type { Address } from "viem"

import type { ChainDeploy } from "@/config/deploys"
import { getPublicClient } from "@/lib/chains"

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

const POOL_LOGIC_ABI = [
  {
    name: "poolManagerLogic",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const

const POOL_MANAGER_LOGIC_ABI = [
  {
    name: "getSupportedAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "asset", type: "address" },
          { name: "isDeposit", type: "bool" },
        ],
      },
    ],
  },
] as const

const MORPHO_BLUE_MANAGER_ABI = [
  {
    name: "getPoolMarkets",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "pool", type: "address" }],
    outputs: [{ name: "", type: "bytes32[]" }],
  },
] as const

export type IdleBalance = {
  raw: bigint
  amount: number
  usd: number | null
}

export async function fetchIdleBalance(deploy: ChainDeploy): Promise<IdleBalance> {
  const client = getPublicClient(deploy)
  const raw = (await client.readContract({
    address: deploy.primaryAsset.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [deploy.poolLogic],
  })) as bigint
  const amount = Number(raw) / 10 ** deploy.primaryAsset.decimals
  return { raw, amount, usd: deploy.primaryAsset.treatAsUsd ? amount : null }
}

export type GuardInfo = {
  poolManagerLogic: Address
  supportedAssets: { asset: Address; isDeposit: boolean }[]
  morphoWhitelistedMarketIds: string[]
  isAavePoolEnabled: boolean
}

export async function fetchGuardInfo(deploy: ChainDeploy): Promise<GuardInfo> {
  const client = getPublicClient(deploy)

  const poolManagerLogic = (await client.readContract({
    address: deploy.poolLogic,
    abi: POOL_LOGIC_ABI,
    functionName: "poolManagerLogic",
  })) as Address

  const supportedAssetsP = client.readContract({
    address: poolManagerLogic,
    abi: POOL_MANAGER_LOGIC_ABI,
    functionName: "getSupportedAssets",
  }) as Promise<readonly { asset: Address; isDeposit: boolean }[]>

  const morphoMarketIdsP: Promise<readonly string[]> = deploy.services.morpho
    ? (client.readContract({
        address: deploy.services.morpho.blueManager,
        abi: MORPHO_BLUE_MANAGER_ABI,
        functionName: "getPoolMarkets",
        args: [deploy.poolLogic],
      }) as Promise<readonly string[]>)
    : Promise.resolve([])

  const [supportedAssetsRaw, morphoMarketIds] = await Promise.all([
    supportedAssetsP,
    morphoMarketIdsP,
  ])

  const supportedAssets = supportedAssetsRaw.map((a) => ({
    asset: a.asset,
    isDeposit: a.isDeposit,
  }))

  const isAavePoolEnabled = supportedAssets.some(
    (a) => a.asset.toLowerCase() === deploy.services.aave.poolAddress.toLowerCase(),
  )

  return {
    poolManagerLogic,
    supportedAssets,
    morphoWhitelistedMarketIds: morphoMarketIds.map((id) => id.toLowerCase()),
    isAavePoolEnabled,
  }
}
