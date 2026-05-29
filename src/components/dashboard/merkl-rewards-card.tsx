import { useQuery } from "@tanstack/react-query"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MerklIcon } from "@/components/icons/merkl-icon"
import { fetchMerklRewards } from "@/services/merkl"
import { formatNumber, formatUsd, fromRaw } from "@/lib/format"
import type { ChainDeploy } from "@/config/deploys"

export function MerklRewardsCard({ deploy }: { deploy: ChainDeploy }) {
  const enabled = !!deploy.services.merkl

  const { data, isLoading, isError } = useQuery({
    queryKey: ["merkl", deploy.key],
    queryFn: () => fetchMerklRewards(deploy),
    enabled,
  })

  if (!enabled) return null

  const rewards = data ?? []
  const claimable = rewards.filter((r) => r.claimable > 0n)
  const totalClaimableUsd = claimable.reduce((acc, r) => {
    const amount = fromRaw(r.claimable, r.decimals)
    return acc + (r.priceUsd ? amount * r.priceUsd : 0)
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MerklIcon className="size-4" />
          Merkl Rewards
          {claimable.length > 0 ? (
            <Badge variant="secondary">{formatUsd(totalClaimableUsd)} claimable</Badge>
          ) : null}
        </CardTitle>
        <CardDescription>
          Incentives accrued by the pool on {deploy.label}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <p className="text-destructive text-sm">Failed to load rewards.</p>
        ) : rewards.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No rewards accrued yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Claimable</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">USD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((r) => {
                const claimableAmount = fromRaw(r.claimable, r.decimals)
                const pendingAmount = fromRaw(r.pending, r.decimals)
                const usd = r.priceUsd ? claimableAmount * r.priceUsd : null
                return (
                  <TableRow key={r.tokenAddress}>
                    <TableCell className="font-medium">{r.symbol}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(claimableAmount, { maxDecimals: 4 })}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatNumber(pendingAmount, { maxDecimals: 4 })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatUsd(usd)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
