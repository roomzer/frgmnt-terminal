import { useNavigate, useSearch } from "@tanstack/react-router"

import {
  defaultDeployKey,
  deployByKey,
  isDeployKey,
  type ChainDeploy,
  type DeployKey,
} from "@/config/deploys"

/**
 * Reads the active chain from the URL (`?chain=base|mega`) and falls back to
 * the default. Returns a setter that updates the search param while preserving
 * the rest of the route state.
 */
export function useActiveDeploy(): {
  deploy: ChainDeploy
  setDeploy: (key: DeployKey) => void
} {
  const search = useSearch({ strict: false }) as { chain?: string }
  const navigate = useNavigate()
  const key: DeployKey = isDeployKey(search.chain)
    ? search.chain
    : defaultDeployKey

  const setDeploy = (next: DeployKey) => {
    navigate({
      to: ".",
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        chain: next,
      })) as never,
      replace: true,
    })
  }

  return { deploy: deployByKey[key], setDeploy }
}
