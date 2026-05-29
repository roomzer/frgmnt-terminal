import { createFileRoute } from "@tanstack/react-router"
import { NetworkIcon } from "@web3icons/react/dynamic"

import { useActiveDeploy } from "@/lib/active-deploy"
import { usePoolSnapshot } from "@/hooks/use-pool-snapshot"
import { formatApy, formatUsd } from "@/lib/format"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { FusdSupplyCard } from "@/components/dashboard/fusd-supply-card"
import { RewardsCard } from "@/components/dashboard/rewards-card"
import { AllocationBreakdown } from "@/components/dashboard/allocation-breakdown"
import { MorphoPositionsCard } from "@/components/dashboard/morpho-positions-card"
import { AavePositionCard } from "@/components/dashboard/aave-position-card"
import { MerklRewardsCard } from "@/components/dashboard/merkl-rewards-card"

type Search = { chain?: string }

export const Route = createFileRoute("/_authed/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    chain: typeof search.chain === "string" ? search.chain : undefined,
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const { deploy } = useActiveDeploy()
  const snapshot = usePoolSnapshot(deploy)

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-end gap-1.5 text-2xl font-bold text-muted-foreground">
            <NetworkIcon
              chainId={deploy.iconChainId ?? deploy.chain.id}
              variant="mono"
              className="size-11"
            />
            {deploy.label}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {snapshot.isLoading ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                formatUsd(snapshot.totals.totalUsd)
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter className="grid grid-cols-2 gap-6 border-t">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs">Deployed</p>
              {snapshot.isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="text-base font-medium tabular-nums">
                  {formatUsd(snapshot.totals.deployedUsd)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs">
                Idle · {deploy.primaryAsset.symbol}
              </p>
              {snapshot.isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="text-base font-medium tabular-nums">
                  {formatUsd(snapshot.totals.idleUsd)}
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
        <StatCard
          label="Weighted APY"
          value={formatApy(snapshot.totals.weightedApy)}
          hint="On deployed capital only."
          loading={snapshot.isLoading}
        />
      </section>

      {deploy.tokens ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FusdSupplyCard deploy={deploy} />
          <RewardsCard deploy={deploy} />
        </section>
      ) : null}

      <AllocationBreakdown
        rows={snapshot.allocations}
        totalUsd={snapshot.totals.totalUsd}
        loading={snapshot.isLoading}
      />

      {deploy.services.morpho ? (
        <MorphoPositionsCard
          positions={snapshot.morpho}
          loading={snapshot.isLoading}
        />
      ) : null}

      <AavePositionCard
        positions={snapshot.aave}
        loading={snapshot.isLoading}
      />

      <MerklRewardsCard deploy={deploy} />

      {snapshot.isError ? (
        <p className="text-xs text-destructive">
          {snapshot.errors.map((e) => e.message).join(" · ")}
        </p>
      ) : null}
    </div>
  )
}
