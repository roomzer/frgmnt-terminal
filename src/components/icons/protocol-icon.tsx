import { AaveIcon } from "./aave-icon"
import { MerklIcon } from "./merkl-icon"
import { MorphoIcon } from "./morpho-icon"

export type Protocol = "aave" | "morpho" | "merkl"

type Props = Omit<React.SVGProps<SVGSVGElement>, "color"> & {
  protocol: Protocol
  size?: number | string
}

const REGISTRY: Record<Protocol, React.ComponentType<Omit<Props, "protocol">>> =
  {
    aave: AaveIcon,
    morpho: MorphoIcon,
    merkl: MerklIcon,
  }

export function ProtocolIcon({ protocol, ...rest }: Props) {
  const Icon = REGISTRY[protocol]
  return <Icon {...rest} />
}
