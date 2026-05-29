import { NetworkBase, NetworkMegaEth } from "@web3icons/react"

import { cn } from "@/lib/utils"
import type { DeployKey } from "@/config/deploys"

type IconComponent = typeof NetworkBase

const ICONS: Record<DeployKey, IconComponent> = {
  base: NetworkBase,
  mega: NetworkMegaEth,
}

export function ChainIcon({
  deployKey,
  className,
  variant = "mono",
}: {
  deployKey: DeployKey
  className?: string
  variant?: "mono" | "branded" | "background"
}) {
  const Icon = ICONS[deployKey]
  return <Icon variant={variant} className={cn("size-4 shrink-0", className)} />
}
