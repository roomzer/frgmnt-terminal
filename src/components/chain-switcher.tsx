import { ChainIcon } from "@/components/chain-icon"
import { useActiveDeploy } from "@/lib/active-deploy"
import { deploys } from "@/config/deploys"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import type { DeployKey } from "@/config/deploys"

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
              <ChainIcon deployKey={deploy.key} />
              <span className="truncate">{deploy.label}</span>
            </span>
          </SelectTrigger>
          <SelectContent className="p-1">
            {deploys.map((d) => (
              <SelectItem key={d.key} value={d.key}>
                <span className="flex items-center gap-2">
                  <ChainIcon deployKey={d.key} />
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
