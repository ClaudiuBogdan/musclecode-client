export interface MockUser {
  id: string;
  username: string;
  roles: string[];
  token: string;
}

export const mockUser: MockUser = {
  id: "mock-user-id",
  username: "mock.user",
  roles: ["user", "admin"],
  token: "mock-token",
};
