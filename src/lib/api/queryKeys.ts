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
