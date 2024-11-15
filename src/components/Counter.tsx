import { useCounterStore } from '../stores/counterStore'

export const Counter = () => {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={decrement}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        -
      </button>
      <span className="text-xl">{count}</span>
      <button
        onClick={increment}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        +
      </button>
    </div>
  )
} 