import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ModelForm } from './ModelForm'
import { useModelsStore } from '@/stores/models'
import { type ModelFormValues } from './schema'
import { type Model } from '@/types/models'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface EditModelDialogProps {
  model: Model;
}

export function EditModelDialog({ model }: EditModelDialogProps) {
  const [open, setOpen] = useState(false)
  const updateModel = useModelsStore((state) => state.updateModel)

  const handleSubmit = (values: ModelFormValues) => {
    updateModel(model.id, values)
    toast.success('Model updated successfully!')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Model</DialogTitle>
          <DialogDescription>
            Update the details for the model. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ModelForm
          onSubmit={handleSubmit}
          defaultValues={model}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  )
} 