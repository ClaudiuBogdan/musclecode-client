import { v4 as uuidv4 } from 'uuid'

export const MODEL_PROVIDERS = ['gemini'] as const;
export type ModelProvider = (typeof MODEL_PROVIDERS)[number];

export interface Model {
    id: string;
    name: string;
    provider: ModelProvider;
    apiKey: string;
    model: string;
    enabled: boolean;
}

export function createNewModel(
    props?: Partial<Omit<Model, 'id'>>,
): Model {
    return {
        id: uuidv4(),
        name: '',
        provider: 'gemini',
        apiKey: '',
        model: '',
        enabled: true,
        ...props,
    };
}