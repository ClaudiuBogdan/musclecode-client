import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator'
import { Switch } from "@/components/ui/switch"
import { useModelsStore } from '@/stores/models'
import { type Model } from '@/types/models'

import { DeleteModelConfirmDialog } from './DeleteModelConfirmDialog'
import { EditModelDialog } from './EditModelDialog'

interface ModelListItemProps {
  model: Model;
}

export function ModelListItem({ model }: ModelListItemProps) {
  const toggleModelStatus = useModelsStore((state) => state.toggleModelStatus)

  const handleToggle = () => {
    toggleModelStatus(model.id)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{model.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`enable-switch-${model.id}`} className="text-sm font-medium">
              {model.enabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              id={`enable-switch-${model.id}`}
              checked={model.enabled}
              onCheckedChange={handleToggle}
              aria-label={model.enabled ? 'Disable model' : 'Enable model'}
            />
          </div>
        </div>
        <CardDescription>
          Provider: {model.provider} | Model: {model.model}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">API Key:</span>
          <span className="font-mono text-sm">********</span> 
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end space-x-2 pt-4">
        <EditModelDialog model={model} />
        <DeleteModelConfirmDialog modelId={model.id} modelName={model.name} />
      </CardFooter>
    </Card>
  )
} 