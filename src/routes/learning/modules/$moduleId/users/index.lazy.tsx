import { createLazyFileRoute } from '@tanstack/react-router'

import { ContentLayout } from '@/components/learning/ContentLayout'
import { UserProgressTracker } from '@/components/learning/UserProgressTracker'
// import { UserProgressTracker } from '@/components/learning/UserProgressTracker'

export const Route = createLazyFileRoute('/learning/modules/$moduleId/users/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { moduleId } = Route.useParams()
    
    return (
        <ContentLayout
            title="Users"
            backLink={`/learning/modules/${moduleId}/`}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        Track and monitor user progress through the learning module.
                    </p>
                </div>
                <UserProgressTracker moduleId={moduleId} />
            </div>
        </ContentLayout>
    )
}
