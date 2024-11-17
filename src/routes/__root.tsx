import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/algorithm">Algorithm</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </>
  ),
})