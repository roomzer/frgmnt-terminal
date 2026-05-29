import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MorphoIcon } from "@/components/icons/morpho-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatApy, formatUsd, truncateAddress } from "@/lib/format"
import type { MorphoPosition } from "@/services/morpho"

export function MorphoPositionsCard({
  positions,
  loading,
}: {
  positions: MorphoPosition[]
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MorphoIcon className="size-4" />
          Morpho Blue Positions
        </CardTitle>
        <CardDescription>
          Supplied across whitelisted Morpho markets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : positions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active positions.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Supplied</TableHead>
                <TableHead className="text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.market.marketId}>
                  <TableCell>
                    <div className="font-medium">
                      {p.market.collateralAsset?.symbol ?? "—"} /{" "}
                      {p.market.loanAsset.symbol}
                    </div>
                    <div className="text-muted-foreground font-mono text-xs">
                      {truncateAddress(p.market.marketId, 8, 6)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUsd(p.state?.supplyAssetsUsd ?? 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatApy(
                      p.market.state?.netSupplyApy ?? p.market.state?.supplyApy,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
