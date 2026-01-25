import { User } from "@shared/types";

export const mockUser: User = {
  id: 12345,
  email: "testuser@disputestrike.com",
  firstName: "Test",
  lastName: "User",
  accountType: "individual",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockContext = {
  user: mockUser,
  // Mock other context properties as needed for the procedure
  req: {},
  res: {},
};
