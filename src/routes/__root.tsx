import { ThemeProvider } from "@/components/theme/theme-provider";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/algorithm/$id" params={{ id: "1234" }}>Algorithm</Link>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
      </QueryClientProvider>
    </>
  ),
});
