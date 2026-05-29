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
import { AaveIcon } from "@/components/icons/aave-icon"
import { formatApy, formatUsd } from "@/lib/format"
import type { AavePosition } from "@/services/aave"

export function AavePositionCard({
  positions,
  loading,
}: {
  positions: AavePosition[]
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AaveIcon className="size-4" />
          Aave V3 Position
        </CardTitle>
        <CardDescription>
          Pool-held aToken balance on Aave V3.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-full" />
        ) : positions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active positions.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Supplied</TableHead>
                <TableHead className="text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.underlyingAsset}>
                  <TableCell className="font-medium">{p.symbol}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUsd(p.supplyBalanceUsd ?? 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatApy(p.supplyApy)}
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
