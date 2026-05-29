import { createPublicClient, http, type PublicClient } from "viem"

import { deploys, type ChainDeploy, type DeployKey } from "@/config/deploys"

const clients = new Map<DeployKey, PublicClient>()

export function getPublicClient(deploy: ChainDeploy): PublicClient {
  const cached = clients.get(deploy.key)
  if (cached) return cached
  const client = createPublicClient({
    chain: deploy.chain,
    transport: http(deploy.rpcUrl),
  })
  clients.set(deploy.key, client)
  return client
}

export function warmClients() {
  for (const d of deploys) getPublicClient(d)
}
