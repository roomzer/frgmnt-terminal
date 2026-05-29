import { useQuery } from "@tanstack/react-query"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchFusdSnapshot } from "@/services/fusd"
import { formatNumber } from "@/lib/format"
import type { ChainDeploy } from "@/config/deploys"

export function FusdSupplyCard({ deploy }: { deploy: ChainDeploy }) {
  const enabled = !!deploy.tokens
  const { data, isLoading, isError } = useQuery({
    queryKey: ["fusd-snapshot", deploy.key],
    queryFn: () => fetchFusdSnapshot(deploy),
    enabled,
  })

  if (!enabled) return null

  const tokens = deploy.tokens!
  const stakedPct = data?.stakedPct ?? 0
  const unstakedPct = 1 - stakedPct

  return (
    <Card>
      <CardHeader>
        <CardDescription>Token Supply</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : isError ? (
            "—"
          ) : (
            <>
              {formatNumber(data!.totalFusd, { maxDecimals: 2 })}{" "}
              <span className="text-muted-foreground text-lg font-medium">
                {tokens.fusd.symbol}
              </span>
            </>
          )}
        </CardTitle>

        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {isLoading || isError ? null : (
            <>
              <span
                className="bg-foreground/80 h-full"
                style={{ width: `${stakedPct * 100}%` }}
                aria-label={`Staked ${(stakedPct * 100).toFixed(2)}%`}
              />
              <span
                className="bg-muted-foreground/40 h-full"
                style={{ width: `${unstakedPct * 100}%` }}
                aria-label={`Unstaked ${(unstakedPct * 100).toFixed(2)}%`}
              />
            </>
          )}
        </div>
      </CardHeader>

      <CardFooter className="grid grid-cols-3 gap-6 border-t">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="bg-foreground/80 size-2 rounded-sm" aria-hidden />
            Staked · {tokens.sfusd.symbol}
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.stakedFusd, { maxDecimals: 2 })}{" "}
              <span className="text-muted-foreground text-xs">
                {(stakedPct * 100).toFixed(2)}%
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span
              className="bg-muted-foreground/40 size-2 rounded-sm"
              aria-hidden
            />
            Unstaked · {tokens.fusd.symbol}
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.unstakedFusd, { maxDecimals: 2 })}{" "}
              <span className="text-muted-foreground text-xs">
                {(unstakedPct * 100).toFixed(2)}%
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">
            {tokens.sfusd.symbol} ↔ {tokens.fusd.symbol}
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-base font-medium tabular-nums">
              {formatNumber(data?.exchangeRate, { maxDecimals: 6 })}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
