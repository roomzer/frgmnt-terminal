import { PrivyProvider } from "@privy-io/react-auth"

const appId = import.meta.env.VITE_PRIVY_APP_ID
const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
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
