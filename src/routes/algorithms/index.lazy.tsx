import { AlgorithmsTable } from '@/components/algorithms'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/algorithms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AlgorithmsTable />
}

export default Route
