import { useQueries } from "@tanstack/react-query"

import type { ChainDeploy } from "@/config/deploys"
import {
  fetchMorphoPositions,
  type MorphoPosition,
} from "@/services/morpho"
import { fetchAavePositions, type AavePosition } from "@/services/aave"
import { fetchIdleBalance, type IdleBalance } from "@/services/onchain"

export type AllocationRow = {
  key: string
  venue: "morpho" | "aave" | "idle"
  label: string
  sublabel: string | null
  usd: number
  apy: number | null
  color: string
  /** Asset symbol — only set for `idle` rows; used to render the token icon. */
  tokenSymbol?: string
}

export type PoolSnapshot = {
  isLoading: boolean
  isError: boolean
  errors: Error[]
  idle: IdleBalance | undefined
  morpho: MorphoPosition[]
  aave: AavePosition[]
  totals: {
    deployedUsd: number
    idleUsd: number
    totalUsd: number
    weightedApy: number | null
  }
  allocations: AllocationRow[]
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

function pickColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!
}

export function usePoolSnapshot(deploy: ChainDeploy): PoolSnapshot {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["idle", deploy.key],
        queryFn: () => fetchIdleBalance(deploy),
      },
      {
        queryKey: ["morpho-positions", deploy.key],
        queryFn: () => fetchMorphoPositions(deploy),
        enabled: !!deploy.services.morpho,
      },
      {
        queryKey: ["aave-positions", deploy.key],
        queryFn: () => fetchAavePositions(deploy),
      },
    ],
  })

  const [idleQ, morphoQ, aaveQ] = queries
  const idle = idleQ.data
  const morpho = morphoQ.data ?? []
  const aave = aaveQ.data ?? []

  const isLoading = queries.some((q) => q.isLoading && q.fetchStatus !== "idle")
  const isError = queries.some((q) => q.isError)
  const errors = queries
    .map((q) => q.error)
    .filter((e): e is Error => e instanceof Error)

  const idleUsd = idle?.usd ?? 0

  const morphoRows: AllocationRow[] = morpho.map((p, i) => {
    const usd = p.state?.supplyAssetsUsd ?? 0
    const collateralSymbol = p.market.collateralAsset?.symbol ?? "—"
    return {
      key: `morpho:${p.market.marketId}`,
      venue: "morpho",
      label: `Morpho · ${collateralSymbol}/${p.market.loanAsset.symbol}`,
      sublabel: p.market.marketId.slice(0, 10) + "…",
      usd,
      apy: p.market.state?.netSupplyApy ?? p.market.state?.supplyApy ?? null,
      color: pickColor(i),
    }
  })

  const aaveRows: AllocationRow[] = aave.map((p, i) => ({
    key: `aave:${p.underlyingAsset}`,
    venue: "aave",
    label: `Aave · ${p.symbol}`,
    sublabel: null,
    usd: p.supplyBalanceUsd ?? 0,
    apy: p.supplyApy,
    color: pickColor(morphoRows.length + i),
  }))

  const deployedRows = [...morphoRows, ...aaveRows].filter((r) => r.usd > 0)
  const deployedUsd = deployedRows.reduce((acc, r) => acc + r.usd, 0)
  const totalUsd = deployedUsd + idleUsd

  let weightedApy: number | null = null
  if (deployedUsd > 0) {
    const weighted = deployedRows.reduce(
      (acc, r) => acc + (r.apy ?? 0) * r.usd,
      0,
    )
    // Idle earns 0% but contributes to the denominator only if we want a "blended" — the
    // protocol manager weights against deployed only, so we mirror that.
    weightedApy = weighted / deployedUsd
  }

  const allocations: AllocationRow[] = [
    ...deployedRows,
    ...(idleUsd > 0
      ? [
          {
            key: "idle",
            venue: "idle" as const,
            label: `Idle · ${deploy.primaryAsset.symbol}`,
            sublabel: null,
            usd: idleUsd,
            apy: 0,
            color: "var(--muted-foreground)",
            tokenSymbol: deploy.primaryAsset.symbol,
          },
        ]
      : []),
  ]

  return {
    isLoading,
    isError,
    errors,
    idle,
    morpho,
    aave,
    totals: { deployedUsd, idleUsd, totalUsd, weightedApy },
    allocations,
  }
}
