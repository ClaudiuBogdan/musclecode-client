import { Line } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../common/Card'
import { fetchUserProgress } from '../../services/api/progress'
import { useAuthStore } from '../../lib/auth/authStore'

export function ProgressOverview() {
  const user = useAuthStore(state => state.user)
  
  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: () => fetchUserProgress(user!.id)
  })

  const chartData = {
    labels: progress?.dates || [],
    datasets: [
      {
        label: 'Problems Solved',
        data: progress?.solved || [],
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.3
      }
    ]
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
      <div className="h-64">
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
    </Card>
  )
} 