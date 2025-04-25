import { z } from 'zod'
import { MODEL_PROVIDERS } from '@/types/models'

export const modelFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  provider: z.enum(MODEL_PROVIDERS),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  model: z.string().min(1, { message: 'Model string is required' }),
});

export type ModelFormValues = z.infer<typeof modelFormSchema>; 