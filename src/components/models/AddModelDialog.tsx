import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useModelsStore } from '@/stores/models'

import { ModelForm } from './ModelForm'
import { type ModelFormValues } from './schema'

export function AddModelDialog() {
  const [open, setOpen] = useState(false)
  const addModel = useModelsStore((state) => state.addModel)

  const handleSubmit = (values: ModelFormValues) => {
    addModel(values)
    toast.success('Model added successfully!')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Model</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
          <DialogDescription>
            Configure a new AI model provider here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ModelForm onSubmit={handleSubmit} submitButtonText="Add Model" />
      </DialogContent>
    </Dialog>
  )
} 