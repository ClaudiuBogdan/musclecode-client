import { useQuery } from '@tanstack/react-query'
import { ProgressOverview } from '../components/dashboard/ProgressOverview'
import { RecommendedAlgorithms } from '../components/dashboard/RecommendedAlgorithms'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { useAuthStore } from '../lib/auth/authStore'

export function DashboardPage() {
  const user = useAuthStore(state => state.user)
  
  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => fetchUserStats(user!.id)
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.email}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStats stats={userStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProgressOverview />
          <RecentActivity className="mt-8" />
        </div>
        <div>
          <RecommendedAlgorithms />
        </div>
      </div>
    </div>
  )
} 