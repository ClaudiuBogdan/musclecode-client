import { createLazyFileRoute } from '@tanstack/react-router'
import { Counter } from '../components/Counter'

export const Route = createLazyFileRoute('/daily')({
  component: Daily,
})

function Daily() {
  return (
    <div className="p-2">
      <h3>Welcome Daily!</h3>
      <div className="mt-4">
        <Counter />
      </div>
    </div>
  )
}
