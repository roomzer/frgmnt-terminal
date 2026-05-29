/**
 * SSR-only stub for `@privy-io/react-auth`.
 *
 * Privy drags a Node-only logger (pino → sonic-boom → fs) into anything that
 * imports it, which can't run on Cloudflare Workers. With SPA mode enabled,
 * Privy code never executes server-side anyway — but it still gets *bundled*
 * because the route files import it at top-level. Aliasing the package to
 * this file in the SSR build keeps the bundle clean.
 *
 * The client build uses the real package; these stubs are never called.
 */
import type { ReactNode } from "react"

export function PrivyProvider({ children }: { children: ReactNode }) {
  return children
}

export function usePrivy() {
  return {
    ready: false,
    authenticated: false,
    user: null,
    logout: async () => {},
  }
}

export function useLogin(_args?: unknown) {
  return { login: async () => {} }
}
