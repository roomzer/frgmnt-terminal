import type { ChainDeploy } from "@/config/deploys"

const MARKETS_QUERY = `
  query GetMarkets($chainId: Int!) {
    markets(
      where: { chainId_in: [$chainId], listed: true }
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
      first: 100
    ) {
      items {
        marketId
        lltv
        loanAsset { address symbol decimals }
        collateralAsset { address symbol decimals }
        state {
          supplyAssetsUsd
          netSupplyApy
          supplyApy
        }
      }
    }
  }
`

const POSITIONS_QUERY = `
  query GetPositions($address: String!, $chainId: Int!) {
    marketPositions(
      where: { userAddress_in: [$address], chainId_in: [$chainId] }
    ) {
      items {
        state {
          supplyShares
          supplyAssets
          supplyAssetsUsd
        }
        market {
          marketId
          lltv
          loanAsset { address symbol decimals }
          collateralAsset { address symbol decimals }
          state {
            supplyAssetsUsd
            netSupplyApy
            supplyApy
          }
        }
      }
    }
  }
`

export type MorphoMarket = {
  marketId: string
  lltv: string
  loanAsset: { address: string; symbol: string; decimals: number }
  collateralAsset: { address: string; symbol: string; decimals: number } | null
  state: {
    supplyAssetsUsd: number | null
    netSupplyApy: number | null
    supplyApy: number | null
  } | null
}

export type MorphoPosition = {
  state: {
    supplyShares: string
    supplyAssets: string | number | null
    supplyAssetsUsd: number | null
  } | null
  market: MorphoMarket
}

type GqlResp<T> = { data?: T; errors?: { message: string }[] }

async function gql<T>(endpoint: string, query: string, variables: object): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Morpho API ${res.status}: ${res.statusText}`)
  const json = (await res.json()) as GqlResp<T>
  if (json.errors?.length) throw new Error(json.errors[0].message)
  if (!json.data) throw new Error("Morpho API returned no data")
  return json.data
}

export async function fetchMorphoMarkets(deploy: ChainDeploy): Promise<MorphoMarket[]> {
  const svc = deploy.services.morpho
  if (!svc) return []
  const data = await gql<{ markets: { items: MorphoMarket[] } }>(
    svc.graphqlEndpoint,
    MARKETS_QUERY,
    { chainId: deploy.chain.id },
  )
  return data.markets.items.filter(
    (m) =>
      m.loanAsset &&
      m.collateralAsset &&
      m.loanAsset.address.toLowerCase() === deploy.primaryAsset.address.toLowerCase(),
  )
}

export async function fetchMorphoPositions(deploy: ChainDeploy): Promise<MorphoPosition[]> {
  const svc = deploy.services.morpho
  if (!svc) return []
  const data = await gql<{ marketPositions: { items: MorphoPosition[] } }>(
    svc.graphqlEndpoint,
    POSITIONS_QUERY,
    {
      address: deploy.poolLogic.toLowerCase(),
      chainId: deploy.chain.id,
    },
  )
  return data.marketPositions.items.filter(
    (p) =>
      p.state &&
      BigInt(p.state.supplyShares) > 0n &&
      p.market.loanAsset &&
      p.market.collateralAsset,
  )
}
