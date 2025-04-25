import { createLazyFileRoute } from '@tanstack/react-router'
import { AddModelDialog, ModelList } from '@/components/models'
import { Toaster } from "sonner"

export const Route = createLazyFileRoute('/settings/models')({
  component: ModelsSettings,
})

function ModelsSettings() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Models</h1>
          <p className="text-muted-foreground">
            Manage your configured AI model providers. The api keys are not stored on the server, only on your browser.
          </p>
        </div>
        <AddModelDialog />
      </div>

      <ModelList />
      <Toaster />
    </div>
  )
}
