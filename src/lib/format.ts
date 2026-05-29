export function formatUsd(value: number | null | undefined, opts?: { compact?: boolean }): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: opts?.compact ? 2 : 2,
  }).format(value)
}

export function formatNumber(
  value: number | null | undefined,
  opts?: { compact?: boolean; maxDecimals?: number },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-US", {
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: opts?.maxDecimals ?? 4,
  }).format(value)
}

/** APY input is a fraction (e.g. 0.0532 → "5.32%"). */
export function formatApy(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function truncateAddress(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 2) return address
  return `${address.slice(0, head)}…${address.slice(-tail)}`
}

/** Convert a token's raw bigint to a number of full units (decimal-aware). */
export function fromRaw(raw: bigint, decimals: number): number {
  if (decimals <= 0) return Number(raw)
  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const frac = raw % divisor
  return Number(whole) + Number(frac) / Number(divisor)
}
