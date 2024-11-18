import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/algorithm">Algorithm</Link>
          <ModeToggle />
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
    </>
  ),
});
