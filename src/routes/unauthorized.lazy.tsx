import { Link, createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Unauthorized Access</h1>
      <p className="text-gray-600">
        You don't have permission to access this resource.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Go to Home
      </Link>
    </div>
  )
}
