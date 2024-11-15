import { createLazyFileRoute } from '@tanstack/react-router'
import { Counter } from '../components/Counter'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <div className="mt-4">
        <Counter />
      </div>
    </div>
  )
}