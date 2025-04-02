export enum UserRoles {
  USER = 'USER',
  REVIEWER = 'REVIEWER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRoles;
  fullName: string;
}
