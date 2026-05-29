import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useLogin, usePrivy } from "@privy-io/react-auth"

import { Button } from "@/components/ui/button"

type Search = { redirect?: string }

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { ready, authenticated } = usePrivy()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()

  const { login } = useLogin({
    onComplete: () => {
      navigate({ to: redirect ?? "/", replace: true })
    },
  })

  useEffect(() => {
    if (ready && authenticated) {
      navigate({ to: redirect ?? "/", replace: true })
    }
  }, [ready, authenticated, navigate, redirect])

  const disabled = !ready || authenticated

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <header className="flex flex-col items-center space-y-3">
          <img src="/fusd_256.png" className="size-22" />
          <h1 className="text-lg font-medium tracking-tight">
            FRGMNT Terminal
          </h1>
        </header>

        <Button
          className="w-full"
          disabled={disabled}
          onClick={() => login({ loginMethods: ["email"] })}
        >
          Sign in with email
        </Button>
      </div>
    </main>
  )
}
