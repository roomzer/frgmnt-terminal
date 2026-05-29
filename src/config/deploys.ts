import type { Address, Chain } from "viem"
import { base } from "viem/chains"
import { defineChain } from "viem"

export const megaeth: Chain = defineChain({
  id: 4326,
  name: "MegaETH",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.megaeth.com/rpc"] },
  },
  blockExplorers: {
    default: { name: "MegaExplorer", url: "https://megaexplorer.xyz" },
  },
})

export type Erc20 = {
  address: Address
  symbol: string
  decimals: number
  /** When the asset is a stablecoin we treat as 1:1 USD for valuation. */
  treatAsUsd: boolean
}

export type MorphoService = {
  graphqlEndpoint: string
  /** dHEDGE manager that whitelists Morpho markets the pool can supply to. */
  blueManager: Address
}

export type AaveService = {
  graphqlEndpoint: string
  /** Aave V3 Pool address — used as the GraphQL `marketAddress`. */
  poolAddress: Address
}

export type MerklService = {
  /** Merkl REST base (no trailing slash). Hit via our proxy in prod. */
  apiBase: string
  distributorAddress: Address
}

/**
 * Protocol-issued tokens for a deploy. The pool's `PoolLogic` is the staked
 * share token (sfUSD) — the unstaked token is minted by `TokenLogic` (fUSD).
 */
export type ProtocolTokens = {
  fusd: Erc20
  sfusd: Erc20
}

export type ChainDeploy = {
  key: "base" | "mega"
  chain: Chain
  /** Pretty name for UI (overrides chain.name if needed). */
  label: string
  /** The dHEDGE PoolLogic proxy — the "fund" address all positions belong to. */
  poolLogic: Address
  /** The primary asset the pool deploys (USDC on base, USDM on mega). */
  primaryAsset: Erc20
  /**
   * RPC URL used for on-chain reads. Defaults to the chain's public RPC if
   * unset — override per-deploy when you want a private node (Alchemy, etc.).
   */
  rpcUrl?: string
  /**
   * chainId @web3icons knows. Defaults to `chain.id`. Override when the icon
   * registry uses a different id than the real network (e.g. MegaETH mainnet).
   */
  iconChainId?: number
  /** fUSD / sfUSD — only present where the protocol has issued share tokens. */
  tokens?: ProtocolTokens
  services: {
    morpho?: MorphoService
    aave: AaveService
    merkl?: MerklService
  }
}

export const baseDeploy: ChainDeploy = {
  key: "base",
  chain: base,
  label: "Base",
  rpcUrl: "https://base-mainnet.g.alchemy.com/v2/9QIISW-qgIkPSncQwc_ID",
  poolLogic: "0x704c56974e0CA4BF8ff8fe8acc51FBF1E053878E",
  primaryAsset: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6,
    treatAsUsd: true,
  },
  tokens: {
    fusd: {
      address: "0xeB82611A2B2dC9FBEAF5903d5decDf801765B759",
      symbol: "fUSD",
      decimals: 18,
      treatAsUsd: true,
    },
    sfusd: {
      address: "0x704c56974e0CA4BF8ff8fe8acc51FBF1E053878E",
      symbol: "sfUSD",
      decimals: 18,
      treatAsUsd: false,
    },
  },
  services: {
    morpho: {
      graphqlEndpoint: "https://blue-api.morpho.org/graphql",
      blueManager: "0x7C700a84365546675B5699206e449B88756E066E",
    },
    aave: {
      graphqlEndpoint: "https://api.v3.aave.com/graphql",
      poolAddress: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    },
    merkl: {
      apiBase: "/api/merkl",
      distributorAddress: "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae",
    },
  },
}

export const megaDeploy: ChainDeploy = {
  key: "mega",
  chain: megaeth,
  label: "MegaETH",
  iconChainId: 6342,
  rpcUrl: "https://megaeth-mainnet.g.alchemy.com/v2/9QIISW-qgIkPSncQwc_ID",
  poolLogic: "0xf06C2D0A52329AeE95d5945cB5e826de53CED581",
  primaryAsset: {
    address: "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7",
    symbol: "USDM",
    decimals: 18,
    treatAsUsd: true,
  },
  tokens: {
    fusd: {
      address: "0x530e517E1344Ed95e9447fD8Bb0c46166cf4d4df",
      symbol: "fUSD",
      decimals: 18,
      treatAsUsd: true,
    },
    sfusd: {
      address: "0xf06C2D0A52329AeE95d5945cB5e826de53CED581",
      symbol: "sfUSD",
      decimals: 18,
      treatAsUsd: false,
    },
  },
  services: {
    aave: {
      graphqlEndpoint: "https://api.v3.aave.com/graphql",
      poolAddress: "0x7e324AbC5De01d112AfC03a584966ff199741C28",
    },
    merkl: {
      apiBase: "/api/merkl",
      distributorAddress: "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae",
    },
  },
}

export const deploys = [baseDeploy, megaDeploy] as const

export type DeployKey = (typeof deploys)[number]["key"]

export const deployByKey: Record<DeployKey, ChainDeploy> = {
  base: baseDeploy,
  mega: megaDeploy,
}

export const defaultDeployKey: DeployKey = "base"

export function isDeployKey(value: unknown): value is DeployKey {
  return value === "base" || value === "mega"
}
