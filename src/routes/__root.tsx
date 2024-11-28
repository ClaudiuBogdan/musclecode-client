import { ThemeProvider } from "@/components/theme/theme-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main>
                <Outlet />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  ),
});
