import { createLazyFileRoute } from '@tanstack/react-router'

import { ContentLayout } from '@/components/learning/ContentLayout'
import { UserDetailedProgress } from '@/components/learning/UserDetailedProgress'

export const Route = createLazyFileRoute('/learning/modules/$moduleId/users/$userId/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { moduleId, userId } = Route.useParams()

    return (
        <ContentLayout
            title="User Details"
            backLink={`/learning/modules/${moduleId}/users`}
        >
            <UserDetailedProgress moduleId={moduleId} userId={userId} />
        </ContentLayout>
    )
} 