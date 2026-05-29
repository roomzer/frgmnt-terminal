import { Pie, PieChart } from "recharts"
import { TokenIcon } from "@web3icons/react/dynamic"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ProtocolIcon } from "@/components/icons/protocol-icon"
import { formatApy, formatUsd } from "@/lib/format"
import type { AllocationRow } from "@/hooks/use-pool-snapshot"

export function AllocationBreakdown({
  rows,
  totalUsd,
  loading,
}: {
  rows: AllocationRow[]
  totalUsd: number
  loading?: boolean
}) {
  const chartData = rows
    .filter((r) => r.usd > 0)
    .map((r) => ({
      name: r.key,
      label: r.label,
      usd: r.usd,
      fill: r.color,
    }))

  const chartConfig: ChartConfig = Object.fromEntries(
    chartData.map((r) => [r.name, { label: r.label, color: r.fill }])
  )

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <CardDescription>
          {loading
            ? "Loading positions..."
            : rows.length === 0
              ? "No active positions"
              : `${rows.length} active ${rows.length === 1 ? "position" : "positions"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex w-full justify-center lg:w-2/5">
          {loading ? (
            <Skeleton className="aspect-square size-55 rounded-full" />
          ) : chartData.length === 0 ? (
            <div className="flex aspect-square size-55 items-center justify-center rounded-full border border-dashed text-xs text-muted-foreground">
              No data
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-60"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const payload = item.payload as
                          | { label?: string; fill?: string }
                          | undefined
                        return (
                          <>
                            <span
                              className="size-2.5 shrink-0 rounded-xs"
                              style={{ backgroundColor: payload?.fill }}
                              aria-hidden
                            />
                            <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                              <span className="text-muted-foreground">
                                {payload?.label}
                              </span>
                              <span className="font-mono font-medium text-foreground tabular-nums">
                                {formatUsd(Number(value))}
                              </span>
                            </div>
                          </>
                        )
                      }}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="usd"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={2}
                />
              </PieChart>
            </ChartContainer>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            : rows.length === 0
              ? null
              : rows.map((r) => {
                  const pct = totalUsd > 0 ? r.usd / totalUsd : 0
                  return (
                    <div
                      key={r.key}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted"
                        style={{ color: r.color }}
                        aria-hidden
                      >
                        {r.venue === "morpho" || r.venue === "aave" ? (
                          <ProtocolIcon
                            protocol={r.venue}
                            className="size-3.5"
                          />
                        ) : r.tokenSymbol ? (
                          <TokenIcon
                            symbol={r.tokenSymbol}
                            variant="mono"
                            className="size-4"
                            fallback={
                              <span
                                className="size-2.5 rounded-sm"
                                style={{ backgroundColor: r.color }}
                              />
                            }
                          />
                        ) : (
                          <span
                            className="size-2.5 rounded-sm"
                            style={{ backgroundColor: r.color }}
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{r.label}</div>
                        {r.sublabel ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {r.sublabel}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="font-medium">{formatUsd(r.usd)}</div>
                        <div className="text-xs text-muted-foreground">
                          {(pct * 100).toFixed(1)}% · {formatApy(r.apy)}
                        </div>
                      </div>
                    </div>
                  )
                })}
        </div>
      </CardContent>
    </Card>
  )
}
