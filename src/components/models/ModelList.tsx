import { useModelsStore } from '@/stores/models'

import { ModelListItem } from './ModelListItem'
import { AddModelTutorial } from '../learning/AddModelTutorial'

export function ModelList() {
  const models = useModelsStore((state) => state.models)

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No Models Configured</h3>
        <p className="text-sm text-muted-foreground">
          Add your first AI model to get started.
        </p>

        <AddModelTutorial />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <ModelListItem key={model.id} model={model} />
      ))}
    </div>
  )
} 