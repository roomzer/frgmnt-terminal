import { useQuery } from "@tanstack/react-query"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRewardsSnapshot } from "@/services/rewards"
import { formatNumber } from "@/lib/format"
import type { ChainDeploy } from "@/config/deploys"

export function RewardsCard({ deploy }: { deploy: ChainDeploy }) {
  const enabled = !!deploy.tokens
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rewards-snapshot", deploy.key],
    queryFn: () => fetchRewardsSnapshot(deploy),
    enabled,
  })

  if (!enabled) return null
  const tokens = deploy.tokens!
  const pendingPct = data?.pendingPct ?? 0
  const harvestedPct = 1 - pendingPct

  return (
    <Card>
      <CardHeader>
        <CardDescription>Rewards</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : isError ? (
            "—"
          ) : (
            <>
              {formatNumber(data!.totalAccrued, { maxDecimals: 2 })}{" "}
              <span className="text-lg font-medium text-muted-foreground">
                {tokens.fusd.symbol}
              </span>
            </>
          )}
        </CardTitle>

        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {isLoading || isError ? null : (
            <>
              <span
                className="h-full bg-foreground/80"
                style={{ width: `${harvestedPct * 100}%` }}
                aria-label={`Harvested ${(harvestedPct * 100).toFixed(2)}%`}
              />
              <span
                className="h-full bg-muted-foreground/40"
                style={{ width: `${pendingPct * 100}%` }}
                aria-label={`Pending ${(pendingPct * 100).toFixed(2)}%`}
              />
            </>
          )}
        </div>
      </CardHeader>

      <CardFooter className="grid grid-cols-3 gap-6 border-t">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2 rounded-sm bg-muted-foreground/40"
              aria-hidden
            />
            Pending
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.pending, { maxDecimals: 2 })}{" "}
              <span className="text-xs text-muted-foreground">
                {(pendingPct * 100).toFixed(1)}%
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm bg-foreground/80" aria-hidden />
            Harvested
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.totalHarvested, { maxDecimals: 2 })}{" "}
              <span className="text-xs text-muted-foreground">
                {(harvestedPct * 100).toFixed(1)}%
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Performance fee</p>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.totalPerformanceFee, { maxDecimals: 2 })}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
