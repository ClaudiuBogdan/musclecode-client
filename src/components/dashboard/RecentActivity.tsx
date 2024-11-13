import { useQuery } from '@tanstack/react-query'
import { Card } from '../common/Card'
import { ActivityItem } from './ActivityItem'
import { fetchUserActivity } from '../../services/api/activity'
import { useAuthStore } from '../../lib/auth/authStore'

export function RecentActivity() {
  const user = useAuthStore(state => state.user)
  
  const { data: activities } = useQuery({
    queryKey: ['userActivity', user?.id],
    queryFn: () => fetchUserActivity(user!.id)
  })

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities?.map(activity => (
          <ActivityItem 
            key={activity.id}
            activity={activity}
          />
        ))}
      </div>
    </Card>
  )
} 