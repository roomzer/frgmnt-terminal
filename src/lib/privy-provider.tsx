import { useEffect, useState } from "react"
import { PrivyProvider } from "@privy-io/react-auth"

const appId = import.meta.env.VITE_PRIVY_APP_ID
const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID

/**
 * Renders PrivyProvider client-side only. PrivyProvider's effects use ofetch
 * to validate the session against Privy's API on mount — on the SSR worker
 * that fetch throws an unhandled `HTTPError` and the request 500s. Gating with
 * `useState` + `useEffect` is hydration-safe: server and first-client render
 * both produce `children` unwrapped (same DOM), then the provider mounts.
 */
export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "dark",
          accentColor: "#ffffff",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
          solana: { createOnLogin: "off" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
