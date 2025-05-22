import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { HotkeysProvider } from "react-hotkeys-hook";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { createRouteGuard } from "@/lib/auth/route-guard";

// import { createOnboardingGuard } from "@/lib/onboarding/route-guard";

const queryClient = new QueryClient();

// Create route guards
const authGuard = createRouteGuard();
// const onboardingGuard = createOnboardingGuard();

export const Route = createRootRoute({
  component: () => (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
          <HotkeysProvider>
            <SidebarProvider>
              <AuthProvider>
                <div className="flex h-dvh w-screen overflow-auto">
                  <AppSidebar />
                  <SidebarInset>
                    <Outlet />
                    <Toaster />
                  </SidebarInset>
                </div>
              </AuthProvider>
            </SidebarProvider>
          </HotkeysProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorProvider>
  ),
  beforeLoad: async () => {
    await authGuard();
    // TODO: enable when onboarding is update to the new flow
    // await onboardingGuard(path.location.pathname);
  },
});
