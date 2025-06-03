export const algorithmKeys = {
  all: ["algorithms"] as const,
  lists: () => [...algorithmKeys.all, "list"] as const,
  list: (filters: string) => [...algorithmKeys.lists(), { filters }] as const,
  details: () => [...algorithmKeys.all, "detail"] as const,
  detail: (algorithmId: string) =>
    [...algorithmKeys.details(), algorithmId] as const,
  userDetails: () => [...algorithmKeys.all, "user-detail"] as const,
  userDetail: (algorithmId: string) =>
    [...algorithmKeys.userDetails(), algorithmId] as const,
} as const;

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  moduleUsers: (moduleId: string) => [...userKeys.lists(), "module", moduleId] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (moduleId: string, userId: string) =>
    [...userKeys.details(), moduleId, userId] as const,
  progress: () => [...userKeys.all, "progress"] as const,
  moduleProgress: (moduleId: string) => [...userKeys.progress(), "module", moduleId] as const,
  userProgress: (moduleId: string, userId: string) =>
    [...userKeys.progress(), moduleId, userId] as const,
} as const;
