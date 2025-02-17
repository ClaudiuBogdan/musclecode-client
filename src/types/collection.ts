import { AlgorithmPreview } from "./algorithm";

export interface Collection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  ownerId: string | null; // null for system collections
  algorithms: AlgorithmPreview[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  parentId?: string; // Reference to original collection if copied
}

export type CollectionPreview = Pick<
  Collection,
  "id" | "name" | "description" | "isPublic"
>;
