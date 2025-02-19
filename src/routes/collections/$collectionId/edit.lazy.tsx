import { createLazyFileRoute } from '@tanstack/react-router'
import { useCollection } from '@/hooks/useCollection'
import { useAlgorithmTemplates } from '@/hooks/useAlgorithmTemplates'
import { useUpdateCollection } from '@/hooks/useUpdateCollection'
import {
  CollectionForm,
  CollectionFormData,
} from '@/components/collections/CollectionForm'
import { useNavigate } from '@tanstack/react-router'
import { createLogger } from '@/lib/logger'
import { showToast } from '@/utils/toast'
import { Loader2 } from 'lucide-react'

const logger = createLogger('EditCollectionPage')

export const Route = createLazyFileRoute('/collections/$collectionId/edit')({
  component: EditCollectionPage,
})

function EditCollectionPage() {
  const { collectionId } = Route.useParams()
  const navigate = useNavigate()

  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollection(collectionId)
  const { data: algorithmTemplates = [], isLoading: isLoadingTemplates } =
    useAlgorithmTemplates()
  const updateCollectionMutation = useUpdateCollection()

  const isLoading =
    isLoadingCollection ||
    isLoadingTemplates ||
    updateCollectionMutation.isPending

  // Handle loading state
  if (isLoadingCollection || isLoadingTemplates) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading collection details...</span>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (collectionError) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Error Loading Collection
          </h1>
          <p className="mt-2 text-muted-foreground">
            {collectionError instanceof Error
              ? collectionError.message
              : 'Failed to load collection details'}
          </p>
        </div>
      </div>
    )
  }

  // Handle not found or unauthorized
  if (!collection) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Collection not found</h1>
          <p className="mt-2 text-muted-foreground">
            The collection you're trying to edit doesn't exist or you don't have
            permission to edit it
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CollectionFormData) => {
    try {
      logger.info('Updating collection', { collectionId, data })
      await updateCollectionMutation.mutateAsync({
        id: collectionId,
        data: {
          ...data,
          // Ensure we're not sending any extra fields
          name: data.name.trim(),
          description: data.description.trim(),
          isPublic: data.isPublic,
          algorithmIds: data.algorithmIds,
          tags: data.tags.filter((tag) => tag.trim() !== ''),
        },
      })
      showToast.success('Collection updated successfully')
      navigate({ to: '/collections/$collectionId', params: { collectionId } })
    } catch (error) {
      logger.error('Failed to update collection', {
        error: error instanceof Error ? error.message : String(error),
        collectionId,
        data,
      })
      showToast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update collection. Please try again.',
      )
    }
  }

  const initialData = {
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    algorithmIds: collection.algorithms.map((a) => a.id),
    tags: collection.tags,
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
        <p className="mt-2 text-muted-foreground">
          Update your collection's details and algorithms
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CollectionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          availableAlgorithms={algorithmTemplates}
        />
      </div>
    </div>
  )
}
