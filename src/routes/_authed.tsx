import { useEffect } from "react"
import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { usePrivy } from "@privy-io/react-auth"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { ready, authenticated } = usePrivy()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (ready && !authenticated) {
      navigate({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      })
    }
  }, [ready, authenticated, navigate, location.href])

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
