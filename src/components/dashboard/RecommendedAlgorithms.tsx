import { useQuery } from '@tanstack/react-query'
import { Card } from '../common/Card'
import { AlgorithmCard } from '../common/AlgorithmCard'
import { fetchRecommendedAlgorithms } from '../../services/api/algorithms'
import { useAuthStore } from '../../lib/auth/authStore'

export function RecommendedAlgorithms() {
  const user = useAuthStore(state => state.user)
  
  const { data: algorithms } = useQuery({
    queryKey: ['recommendedAlgorithms', user?.id],
    queryFn: () => fetchRecommendedAlgorithms(user!.id)
  })

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      <div className="space-y-4">
        {algorithms?.map(algorithm => (
          <AlgorithmCard 
            key={algorithm.id}
            algorithm={algorithm}
          />
        ))}
      </div>
    </Card>
  )
} 