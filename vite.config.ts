import { fileURLToPath, URL } from "node:url"
import { defineConfig, type Plugin } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { cloudflare } from "@cloudflare/vite-plugin"

const privyStub = fileURLToPath(
  new URL("./src/lib/privy-stub.ts", import.meta.url),
)

/**
 * Privy drags pino → sonic-boom → require('fs') into anything that imports it,
 * which can't run on Cloudflare Workers. In SPA mode the Privy-using components
 * never render server-side, so the SSR bundle only needs type-compatible stubs.
 */
function privySsrStubPlugin(): Plugin {
  return {
    name: "privy-ssr-stub",
    enforce: "pre",
    resolveId(id) {
      if (id !== "@privy-io/react-auth") return null
      if (this.environment?.name !== "ssr") return null
      return privyStub
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    privySsrStubPlugin(),
    devtools(),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
  ],
})

export default config
