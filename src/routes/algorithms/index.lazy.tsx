import { createLazyFileRoute } from '@tanstack/react-router'

import { AlgorithmsTable } from '@/components/algorithms'

export const Route = createLazyFileRoute('/algorithms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AlgorithmsTable />
}

export default Route
