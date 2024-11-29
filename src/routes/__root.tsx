import { ThemeProvider } from "@/components/theme/theme-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "@/components/ui/Toaster";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <SidebarProvider>
          <div className="flex h-screen w-screen overflow-auto">
            <AppSidebar />
            <SidebarInset>
              <main>
                <div>
                  <Outlet />
                  <Toaster />
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
});
