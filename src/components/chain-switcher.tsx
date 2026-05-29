import { NetworkIcon } from "@web3icons/react/dynamic"

import { cn } from "@/lib/utils"
import { useActiveDeploy } from "@/lib/active-deploy"
import { deploys } from "@/config/deploys"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import type { ChainDeploy, DeployKey } from "@/config/deploys"

function ChainIcon({
  deploy,
  className,
}: {
  deploy: ChainDeploy
  className?: string
}) {
  return (
    <NetworkIcon
      chainId={deploy.iconChainId ?? deploy.chain.id}
      variant="mono"
      className={cn("size-4 shrink-0", className)}
    />
  )
}

export function ChainSwitcher() {
  const { deploy, setDeploy } = useActiveDeploy()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Select
          value={deploy.key}
          onValueChange={(v) => setDeploy(v as DeployKey)}
        >
          <SelectTrigger className="w-full" aria-label="Chain">
            <span className="flex min-w-0 items-center gap-2">
              <ChainIcon deploy={deploy} />
              <span className="truncate">{deploy.label}</span>
            </span>
          </SelectTrigger>
          <SelectContent className="p-1">
            {deploys.map((d) => (
              <SelectItem key={d.key} value={d.key}>
                <span className="flex items-center gap-2">
                  <ChainIcon deploy={d} />
                  {d.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
