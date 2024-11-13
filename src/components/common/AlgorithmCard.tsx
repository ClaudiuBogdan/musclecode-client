import { Link } from '@tanstack/react-router'
import type { Algorithm } from '../../types/dashboard'

interface AlgorithmCardProps {
  algorithm: Algorithm
}

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  const difficultyColor = {
    EASY: 'text-green-600 bg-green-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    HARD: 'text-red-600 bg-red-50'
  }[algorithm.difficulty]

  return (
    <Link
      to="/algorithms/$algorithmId"
      params={{ algorithmId: algorithm.id }}
      className="block p-4 rounded-lg hover:bg-gray-50 transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{algorithm.title}</h3>
          <p className="text-sm text-gray-500">{algorithm.category}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${difficultyColor}`}>
          {algorithm.difficulty}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Completion Rate: {algorithm.completionRate}%
      </div>
    </Link>
  )
} 