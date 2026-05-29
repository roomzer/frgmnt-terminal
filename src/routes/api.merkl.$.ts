import { createFileRoute } from "@tanstack/react-router"

const MERKL_BASE = "https://api.merkl.xyz"

export const Route = createFileRoute("/api/merkl/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const splat = params._splat ?? ""
        const url = new URL(request.url)
        const target = `${MERKL_BASE}/${splat}${url.search}`
        const upstream = await fetch(target, {
          headers: { accept: "application/json" },
        })
        const body = await upstream.text()
        return new Response(body, {
          status: upstream.status,
          headers: {
            "content-type":
              upstream.headers.get("content-type") ?? "application/json",
            "cache-control": "public, max-age=15",
          },
        })
      },
    },
  },
})
